import { drawSongMetaList } from '../view/songMetaList'
import { Song } from "../types/Song"
import { Session } from "koishi"
import { Server, getServerByName } from '../types/Server'

export async function commandSongMeta(session: Session<'tsugu', never>, text: string) {
    const default_servers = session.user.tsugu.default_server
    let server: Server
    if (!text) {
        server = default_servers[0]
    }
    else {
        server = getServerByName(text)
    }
    if (server == undefined) {
        return '错误: 服务器不存在'
    }
    return await drawSongMetaList(server)
}