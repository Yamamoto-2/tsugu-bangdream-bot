import { Database, Random, Session, h } from "koishi";
import { bindingPlayerPromptWaitingTime, serverNameFullList } from "../config";
import { Server, getServerByName } from "../types/Server";
import { Player } from "../types/Player";
import { drawPlayerDetail } from "../view/playerDetail";
import { cursorTo } from "readline";

var rand = new Random()

export enum BindingStatus {
    None, Verifying, Success, Failed
}

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
        return '错误: 服务器不存在，请不要在参数中添加玩家ID'
    }
    const curServer = playerBinding.server_list[server]

    // 如果玩家在该服务器下已绑定
    // 返回已绑定玩家的信息
    if (curServer.bindingStatus == BindingStatus.Success) {
        const playerId = curServer.gameID
        return `你已经绑定了${serverNameFullList[server]}玩家数据: ${playerId}`
    }
    else if (curServer.bindingStatus == BindingStatus.Verifying) {
        return `正在验证玩家信息${curServer.gameID}, 验证码为${curServer.verifyCode}, 请等待验证完成`
    }

    // 绑定流程
    // 对于请求api失败，可进行快速重试

    // 获得验证码
    const tempID = curServer.bindingStatus == BindingStatus.None ? rand.int(10000, 99999) : curServer.verifyCode

    if (curServer.bindingStatus == BindingStatus.None)
        await session.send(`请将你的评论(个性签名)改为${tempID}后，直接发送你的玩家id`)
    else
        await session.send(`你的上次绑定尝试(玩家ID:${curServer.gameID}, 验证码:${curServer.verifyCode})失败，发送\"y\"以自动重试，发送\"n\"以取消`)

    // 等待下一步录入
    const input = await session.prompt(bindingPlayerPromptWaitingTime)

    // 处理玩家输入
    let playerId: number
    if (!input) {
        // prompt超时
        curServer.verifyCode = undefined
        curServer.bindingStatus = BindingStatus.None
        return '错误: 等待超时'
    }
    if (curServer.bindingStatus == BindingStatus.Failed) {
        if (input == "y") {
            playerId = curServer.gameID
            await session.send(`将为${playerId}重试, 请稍后`)
        }
        else if (input == "n") {
            curServer.verifyCode = undefined
            curServer.bindingStatus = BindingStatus.None
            curServer.gameID = 0
            return '已取消重试'
        }
        else return '错误: 未知的输入'
    }
    else {
        playerId = parseInt(input)
    }

    if (Number.isNaN(playerId)) {
        return '错误: 无效的玩家id'
    }

    // 记录绑定状态以防止意外情况发生
    curServer.bindingStatus = BindingStatus.Verifying
    curServer.verifyCode = tempID

    // 验证玩家信息
    const player = new Player(playerId, server)
    curServer.gameID = playerId
    await session.send(`正在验证玩家信息${playerId}，请稍后...`)
    await player.initFull()
    if (player.initError) {
        curServer.bindingStatus = BindingStatus.Failed
        // 此处不重置验证码和玩家id，以备重试时直接使用
        return '错误: 请求api超时，请稍后重试'
    }
    else if (!player.isExist) {
        curServer.bindingStatus = BindingStatus.None
        curServer.verifyCode = undefined
        curServer.gameID = 0
        return `错误: 不存在玩家${playerId}`
    }
    else if (player.profile.introduction == tempID.toString()) {
        // 修改玩家绑定信息
        // 清除验证码，将绑定状态设为 Success
        session.send(`绑定${serverNameFullList[server]}玩家${playerId}成功, 正在生成玩家状态图片`)
        playerBinding.platform = session.platform
        playerBinding.user_id = session.userId
        curServer.bindingStatus = BindingStatus.Success
        curServer.verifyCode = undefined
        return await drawPlayerDetail(player.playerId, server)
    }
    else {
        curServer.gameID = 0
        curServer.bindingStatus = BindingStatus.None
        curServer.verifyCode = undefined
        return '错误: 签名与验证码不匹配'
    }
}

export async function commandUnbindPlayer(session: Session<'tsugu', never>, serverName: string, force: boolean = false) {
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
    const curServer = playerBinding.server_list[server]

    if (curServer.bindingStatus == BindingStatus.Success) {
        curServer.bindingStatus = BindingStatus.None
        curServer.verifyCode = undefined
        curServer.gameID = 0
        return `${serverNameFullList[server]}玩家数据解绑成功`
    }
    else if (curServer.bindingStatus != BindingStatus.None && force) {
        curServer.bindingStatus = BindingStatus.None
        curServer.verifyCode = undefined
        curServer.gameID = 0
        return `成功强制重置${serverNameFullList[server]}玩家绑定状态`
    }
    else if (curServer.bindingStatus == BindingStatus.Verifying) {
        return `玩家数据${curServer.gameID}正在验证中，请等待验证完成`
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
    const curServer = playerBinding.server_list[server]

    if (curServer.bindingStatus != BindingStatus.Success) {
        return `错误: 未检测到${serverNameFullList[server]}的玩家数据`
    }
    else {
        return await drawPlayerDetail(curServer.gameID, server)
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
    if (new Set(servers).size != servers.length) {
        return '错误: 指定了重复的服务器'
    }
    if (servers.length == 0) {
        return '错误: 请指定至少一个服务器'
    }
    if (servers.includes(undefined)) {
        return '错误: 指定了不存在的服务器'
    }
    else {
        playerBinding.default_server = servers
        return `成功切换默认服务器顺序: ${servers.map(s => serverNameFullList[s]).join(", ")}`
    }
}