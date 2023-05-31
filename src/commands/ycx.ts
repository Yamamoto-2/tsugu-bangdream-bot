import {drawCutoffDetail} from '../view/cutoffDetail'
import { Server,defaultserverList } from '../types/Server';
import {getPresentEvent} from '../types/Event'

export async function commandYcx(argv: any, tier: number, serverName: string, eventId: number) {
    if(!tier){
        return '请输入排名'
    }
    if(!serverName){
        serverName = defaultserverList[0].serverName
    }
    else{
        let tempServer =  new Server(serverName)
        if(!tempServer.isExist){
            return '请输入正确的服务器'
        }
    }
    var server = new Server(serverName)
    console.log(server)
    if(!eventId){
        eventId = getPresentEvent(server).eventId
    }
    return(drawCutoffDetail(eventId,tier,server))

}