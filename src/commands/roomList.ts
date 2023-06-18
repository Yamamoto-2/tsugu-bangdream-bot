import {queryAllRoom, Room} from '../types/Room'
import {getDataFromBackend} from './utils'


export async function commandRoomList (backendUrl:string,keyword?:string):Promise<Array<string | Buffer>>{
    let tempRoomList = await queryAllRoom()
    if (tempRoomList.length == 0) {
        return ['myc']
    }
    let roomList= []
    for (let i = 0; i < tempRoomList.length; i++) {
        const room = tempRoomList[i]
        if (keyword != undefined) {
            if (!room.rawMessage.includes(keyword)) {
                continue
            }
        }
        roomList.push(room)
    }
    if(roomList.length == 0 && keyword != undefined){
        return [`没有找到包含 ${keyword} 的房间`]
    }
    return await getDataFromBackend(`${backendUrl}/roomList`, {
        roomList
    })
}