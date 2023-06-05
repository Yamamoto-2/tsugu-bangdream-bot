import { drawCutoffListOfEvent } from '../view/cutoffListOfEvent'
import { Server, defaultserverList, getServerByName } from '../types/Server';
import { getPresentEvent } from '../types/Event'

export async function commandYcxAll(argv: any, serverName: string, eventId: number) {

    if (!serverName) {
        serverName = defaultserverList[0].toString()
    }
    else {
        let tempServer = getServerByName(serverName)
        if (!tempServer) {
            return '请输入正确的服务器'
        }
    }
    var server = getServerByName(serverName)
    console.log(server)
    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }
    return (drawCutoffListOfEvent(eventId, server))

}