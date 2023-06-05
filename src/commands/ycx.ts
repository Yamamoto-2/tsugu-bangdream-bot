import { drawCutoffDetail } from '../view/cutoffDetail'
import { Server, defaultserverList, getServerByName } from '../types/Server';
import { getPresentEvent } from '../types/Event'

export async function commandYcx(argv: any, tier: number, serverName: string, eventId: number) {
    if (!tier) {
        return '请输入排名'
    }
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
    return (drawCutoffDetail(eventId, tier, server))

}