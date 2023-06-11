import { Session, isInteger } from "koishi"
import { drawPlayerDetail } from "../view/playerDetail";
import { Server, getServerByName } from "../types/Server";

export async function commandSearchPlayer(session: Session<'tsugu', never>, playerId: number, serverName: string, useEasyBG: boolean) {
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

    if (isInteger(playerId)) {
        return await drawPlayerDetail(playerId, server, useEasyBG)
    }
    return '错误: 请输入正确的卡池ID'
}