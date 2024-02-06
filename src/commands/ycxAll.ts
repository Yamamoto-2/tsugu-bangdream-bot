import { Server, getServerByName } from '../types/Server';
import { getDataFromBackend } from './utils'

export async function commandYcxAll(backendUrl: string, server_mode: Server, serverName: string, eventId: number, compress: boolean): Promise<Array<Buffer | string>> {
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

    return await getDataFromBackend(`${backendUrl}/ycxAll`, {
        server,
        eventId,
        compress
    })

}