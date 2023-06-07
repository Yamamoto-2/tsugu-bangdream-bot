import { drawCutoffListOfEvent } from '../view/cutoffListOfEvent'
import { Server, getServerByName } from '../types/Server';
import { getPresentEvent } from '../types/Event'
import { Session } from 'koishi';

export async function commandYcxAll(session: Session<'tsugu', never>, serverName: string, eventId: number) {
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
    return (drawCutoffListOfEvent(eventId, server))

}