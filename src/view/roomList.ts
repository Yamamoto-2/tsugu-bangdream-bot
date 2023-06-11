import { drawRoomListTitle, drawRoonInList } from "../components/list/room";
import { outputFinalBuffer } from "../image/output";
import { Room, queryAllRoom } from "../types/Room";
import { Session, h } from "koishi";

export async function drawRoomList(session: Session, keyword?: string) {
    let all = []
    all.push(await drawRoomListTitle())
    let roomList = await queryAllRoom()
    if (roomList.length == 0) {
        return 'myc'
    }
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i]
        if (keyword != undefined) {
            if (!room.rawMessage.includes(keyword)) {
                continue
            }
        }
        all.push(await drawRoonInList(room))
    }
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true,
        startWithSpace: false
    })
    return h.image(buffer, 'image/png')
}





