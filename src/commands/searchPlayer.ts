import { Server, getServerByName } from "../types/Server";
import { tsuguUser } from "../config";
import {getDataFromBackend} from './utils'


export async function commandSearchPlayer(backendUrl:string,user: tsuguUser, playerId: number, serverName: string, useEasyBG: boolean, compress: boolean=false): Promise<Array<Buffer | string>> {
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
    
    return await getDataFromBackend(`${backendUrl}/searchPlayer`, {
        server,
        playerId,
        useEasyBG,
        compress
    })
}