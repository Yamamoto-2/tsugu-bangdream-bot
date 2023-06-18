import { Server, getServerByName } from '../types/Server'
import {getDataFromBackend} from './utils'


export async function commandSongMeta(backendUrl:string,default_servers:Server[], text: string): Promise<Array<Buffer | string>>{
    let server: Server
    if (!text) {
        server = default_servers[0]
    }
    else {
        server = getServerByName(text)
    }
    if (server == undefined) {
        return ['错误: 服务器不存在']
    }
    return await getDataFromBackend(`${backendUrl}/songMeta`, {
        default_servers,
        server
    })
}   