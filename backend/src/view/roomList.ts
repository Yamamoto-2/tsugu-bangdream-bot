import { drawRoomListTitle, drawRoonInList } from "../components/list/room";
import { outputFinalBuffer } from "../image/output";
import { Room, queryAllRoom } from "../types/Room";

export async function drawRoomList(roomList:Room[]):Promise<Array<Buffer | string>> {
    let all = []
    all.push(await drawRoomListTitle())
    //let roomList = await queryAllRoom()
    if (roomList.length == 0) {
        return ['myc']
    }
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i]
        all.push(await drawRoonInList(room))
    }
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        startWithSpace: false
    })
    return [buffer]
}





