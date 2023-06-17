import { drawPlayerDetail } from "../view/playerDetail";
import { Server, getServerByName } from "../types/Server";
import { tsuguUser } from "../config";
import { isInteger } from './utils'

export async function commandSearchPlayer(user: tsuguUser, playerId: number, serverName: string, useEasyBG: boolean): Promise<Array<Buffer | string>> {
    let server: Server
    if (!serverName) {
        server = user.server_mode
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return ['错误: 服务器不存在']
    }
    return await drawPlayerDetail(playerId, server, useEasyBG)
    return ['错误: 请输入正确的卡池ID']
}