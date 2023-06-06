import { Database, Random, Session, h } from "koishi";
import { bindingPlayerPromptWaitingTime, defaultserver, serverNameFullList } from "../config";
import { Server, getServerByName } from "../types/Server";
import { Player } from "../types/Player";
import { drawPlayerDetail } from "../view/playerDetail";

var rand = new Random()

export async function commandBindPlayer(session: Session<'tsugu', never>, serverName: string) {
    // 获得待绑定的服务器
    if (!serverName) {
        serverName = Server[defaultserver[0]]
    }
    let server: Server = getServerByName(serverName)
    if (server == undefined) {
        return '错误: 服务器不存在'
    }

    // 如果玩家在该服务器下已绑定
    // 返回已绑定玩家的信息
    if (session.user.tsugu.server_list[server] != 0) {
        const playerId = session.user.tsugu.server_list[server]
        await session.send(`你已经绑定了${serverNameFullList[server]}玩家数据: ${playerId}`)
        const player = new Player(playerId, server)
        return await drawPlayerDetail(player.playerId, server)
    }

    // 绑定流程
    // 生成随机验证码
    const tempID = rand.int(10000, 99999).toString()

    // 等待下一步录入
    await session.send(`请将你的评论(个性签名)改为${tempID}后，发送你的玩家id`)
    const playerId = await session.prompt(bindingPlayerPromptWaitingTime)

    // 处理玩家输入的id
    if (!playerId) {
        return '错误: 等待超时'
    }
    const player = new Player(parseInt(playerId), server)

    // 验证玩家信息
    await session.send(`正在验证玩家信息${playerId}，请稍后...`)
    await player.initFull()
    if (player.profile.introduction == tempID) {
        // 修改玩家绑定信息
        session.user.tsugu.server_list[server] = player.playerId
        return await drawPlayerDetail(player.playerId, server)
    }
    else {
        return '错误: 签名与验证码不匹配'
    }
}