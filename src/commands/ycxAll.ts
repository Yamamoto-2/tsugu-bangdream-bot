import { drawCutoffListOfEvent } from '../view/cutoffListOfEvent'
import { Server, getServerByName } from '../types/Server';
import { getPresentEvent } from '../types/Event'

export async function commandYcxAll(server_mode:Server, serverName: string, eventId: number):Promise<Array<Buffer | string>> {
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
    return drawCutoffListOfEvent(eventId, server)

}