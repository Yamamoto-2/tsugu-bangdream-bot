import { Database, Random, Session, h } from "koishi";
import { bindingPlayerPromptWaitingTime, defaultserver, serverNameFullList } from "../config";
import { Server, getServerByName } from "../types/Server";
import { Player } from "../types/Player";
import { drawPlayerDetail } from "../view/playerDetail";

var rand = new Random()

export async function commandBindPlayer(session: Session<'tsugu', never>, serverName: string) {
    const playerBinding = session.user.tsugu

    // 获得待绑定的服务器
    let server: Server
    // 获得待绑定的服务器
    if (!serverName) {
        server = playerBinding.server_mode
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return '错误: 服务器不存在'
    }

    // 如果玩家在该服务器下已绑定
    // 返回已绑定玩家的信息
    if (playerBinding.server_list[server] != 0) {
        const playerId = playerBinding.server_list[server]
        await session.send(`你已经绑定了${serverNameFullList[server]}玩家数据: ${playerId}`)
        const player = new Player(playerId, server)
        return await drawPlayerDetail(player.playerId, server)
    }

    // 绑定流程
    // 生成随机验证码
    const tempID = rand.int(10000, 99999).toString()

    // 等待下一步录入
    await session.send(`请将你的评论(个性签名)改为${tempID}后，发送你的玩家id`)
    const input = await session.prompt(bindingPlayerPromptWaitingTime)

    // 处理玩家输入的id
    if (!input) {
        return '错误: 等待超时'
    }
    const playerId = parseInt(input)
    if (Number.isNaN(playerId)) {
        return '错误: 无效的玩家id'
    }

    // 验证玩家信息
    const player = new Player(playerId, server)
    await session.send(`正在验证玩家信息${playerId}，请稍后...`)
    await player.initFull()
    if (player.profile.introduction == tempID) {
        // 修改玩家绑定信息
        playerBinding.platform = session.platform
        playerBinding.user_id = session.userId
        playerBinding.server_list[server] = player.playerId
        return await drawPlayerDetail(player.playerId, server)
    }
    else {
        return '错误: 签名与验证码不匹配'
    }
}

export async function commandUnbindPlayer(session: Session<'tsugu', never>, serverName: string) {
    const playerBinding = session.user.tsugu
    let server: Server
    if (!serverName) {
        server = playerBinding.server_mode
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return '错误: 服务器不存在'
    }

    if (playerBinding.server_list[server]) {
        playerBinding.server_list[server] = 0
        return `${serverNameFullList[server]}玩家数据解绑成功`
    }
    else {
        return `错误: 未检测到${serverNameFullList[server]}的玩家数据`
    }
}
export async function commandPlayerInfo(session: Session<'tsugu', never>, serverName: string) {
    const playerBinding = session.user.tsugu
    let server: Server
    if (!serverName) {
        server = playerBinding.server_mode
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return '错误: 服务器不存在'
    }

    if (!playerBinding.server_list[server]) {
        return `错误: 未检测到${serverNameFullList[server]}的玩家数据`
    }
    else {
        return await drawPlayerDetail(playerBinding.server_list[server], server)
    }
}

export async function commandSwitchServerMode(session: Session<'tsugu', never>, serverName: string) {
    const playerBinding = session.user.tsugu
    let server: Server
    if (!serverName) {
        return '错误: 未指定服务器'
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return '错误: 服务器不存在'
    }

    playerBinding.server_mode = server
    return `已切换到${serverNameFullList[server]}模式`
}

export async function commandSwitchDefaultServer(session: Session<'tsugu', never>, serverName: string[]) {
    const playerBinding = session.user.tsugu
    const servers = serverName.map(s => getServerByName(s))
    if (servers.includes(undefined)) {
        return '错误: 指定了不存在的服务器'
    }
    else {
        playerBinding.default_server = servers
        return `成功切换默认服务器顺序: ${servers.map(s => serverNameFullList[s]).join(", ")}`
    }
}