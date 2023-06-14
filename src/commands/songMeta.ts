import { drawSongMetaList } from '../view/songMetaList'
import { Server, getServerByName } from '../types/Server'

export async function commandSongMeta(default_servers:Server[], text: string): Promise<Array<Buffer | string>>{
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
    return await drawSongMetaList(server)
}