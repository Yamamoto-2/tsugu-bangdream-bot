import { drawRoomListTitle, drawRoonInList } from "@/components/list/room";
import { outputFinalBuffer } from "@/image/output";
import { Room } from "@/types/Room";

export async function drawRoomList(roomList: Room[], compress: boolean): Promise<Array<Buffer | string>> {
    let all = []
    if (roomList.length == 0) {
        return ['myc']
    }
    all.push(await drawRoomListTitle())
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i]
        all.push(await drawRoonInList(room))
    }
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        startWithSpace: false,
        compress:compress,
    })
    return [buffer]
}





