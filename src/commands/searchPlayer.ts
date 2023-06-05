import { isInteger } from "koishi"
import { drawPlayerDetail } from "../view/playerDetail";
import { Server, getServerByName } from "../types/Server";

export async function commandSearchPlayer(argv: any, playerId: number, serverName: string) {
    if (!playerId) {
        return '错误: 请输入卡池ID'
    }
    if (!serverName) {
        return '错误: 缺少服务器'
    }
    console.log(argv)
    var server = getServerByName(serverName)
    if (!server) {
        return '错误: 服务器不存在'
    }
    if (isInteger(playerId)) {
        return await drawPlayerDetail(playerId, server)
    }
    return '错误: 请输入正确的卡池ID'
}