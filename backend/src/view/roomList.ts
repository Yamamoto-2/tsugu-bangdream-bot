import { drawRoomListTitle, drawRoonInList } from "@/components/list/room";
import { outputFinalBuffer } from "@/image/output";
import { Room } from "@/types/Room";

export async function drawRoomList(roomList: Room[], compress: boolean): Promise<Array<Buffer | string>> {
    let all = [];
    if (roomList.length === 0) {
        return ['myc'];
    }
    const titleBuffer = await drawRoomListTitle();
    all.push(titleBuffer);
    const roomBuffers = await Promise.all(roomList.map(room => drawRoonInList(room)));
    all = all.concat(roomBuffers);
    const buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        startWithSpace: false,
        compress: false,
    });
    return [buffer];
}







