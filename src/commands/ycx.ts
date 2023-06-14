import { drawCutoffDetail } from '../view/cutoffDetail'
import { Server, getServerByName } from '../types/Server';
import { getPresentEvent } from '../types/Event'

export async function commandYcx(server_mode:Server, tier: number, serverName: string, eventId: number):Promise<Array<Buffer | string>> {
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

    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }
    return await drawCutoffDetail(eventId, tier, server)

}