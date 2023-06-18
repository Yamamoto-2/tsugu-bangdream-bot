
import { Server, getServerByName} from "../types/Server"
import {getDataFromBackend} from './utils'

export async function commandYcx(backendUrl:string,server_mode:Server, tier: number, serverName: string, eventId: number):Promise<Array<Buffer | string>> {
    if (!tier) {
        return ['请输入排名']
    }
    let server: Server
    if (!serverName) {
        server = server_mode
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return ['错误: 服务器不存在']
    }
    return await getDataFromBackend(`${backendUrl}/ycx`, {
        server,
        tier,
        eventId
    })
}