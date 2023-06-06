import { Database, Random, Session, h } from "koishi";
import { bindingPlayerPromptWaitingTime, defaultserver, serverNameFullList } from "../config";
import { Server, getServerByName } from "../types/Server";
import { Player } from "../types/Player";
import { drawPlayerDetail } from "../view/playerDetail";

var rand = new Random()

export async function commandBindPlayer(session: Session<"tsugu_user_id" | "tsugu_platform" | "tsugu_server_mode" | "tsugu_default_server" | "tsugu_car" | "tsugu_server_list", never>, serverName: string) {
    if (!serverName) {
        serverName = Server[defaultserver[0]]
    }
    let server: Server = getServerByName(serverName)
    if (server == undefined) {
        return '错误: 服务器不存在'
    }
    if (session.user.tsugu_server_list[server] != 0) {
        const playerId = session.user.tsugu_server_list[server]
        await session.send(`你已经绑定了${serverNameFullList[server]}玩家数据: ${playerId}`)
        const player = new Player(playerId, server)
        return await drawPlayerDetail(player.playerId, server)
    }
    const tempID = rand.id(5)
    await session.send(`请将你的评论(个性签名)改为${tempID}后，发送你的玩家id`)
    const playerId = await session.prompt(bindingPlayerPromptWaitingTime)
    if (!playerId) {
        return '错误: 等待超时'
    }
    const player = new Player(parseInt(playerId), server)
    await session.send(`正在验证玩家信息${playerId}，请稍后...`)
    await player.initFull()
    if (player.profile.introduction == tempID) {
        session.user.tsugu_server_list[server] = player.playerId
        session.user.tsugu_platform = session.platform
        session.user.tsugu_user_id = session.userId
        return await drawPlayerDetail(player.playerId, server)
    }
    else {
        return '错误: 签名与验证码不匹配'
    }
}