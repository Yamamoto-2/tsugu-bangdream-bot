import {drawCutoffListOfEvent} from '../view/cutoffListOfEvent'
import { Server,defaultserverList } from '../types/Server';
import {getPresentEvent} from '../types/Event'

export async function commandYcxAll(argv: any, serverName: string, eventId: number) {

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
    return(drawCutoffListOfEvent(eventId,server))

}