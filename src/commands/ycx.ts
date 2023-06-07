import { drawCutoffDetail } from '../view/cutoffDetail'
import { Server, getServerByName } from '../types/Server';
import { getPresentEvent } from '../types/Event'
import { Session } from 'koishi';

export async function commandYcx(session: Session<'tsugu', never>, tier: number, serverName: string, eventId: number) {
    if (!tier) {
        return '请输入排名'
    }
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

    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }
    return await drawCutoffDetail(eventId, tier, server)

}