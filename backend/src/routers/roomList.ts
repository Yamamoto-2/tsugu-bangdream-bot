import { drawRoomList } from '../view/roomList';
import { listToBase64, isServerList, isServer } from './utils';
import { Room } from '../types/Room';
import { Player } from '../types/Player';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { roomList } = req.body;
    let tempRoomlist: Room[]
    // 检查类型是否正确
    try {
        tempRoomlist = getRoomList(roomList)
    } catch (e) {
        res.status(400).send('错误: 参数类型不正确');
        return;
    }
    try {
        const result = await commandRoomList(tempRoomlist);
        res.send(listToBase64(result));
    } catch (e) {
        res.status(400).send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandRoomList(roomList: Room[]): Promise<Array<string | Buffer>> {
    if (roomList.length == 0) {
        return ['myc']
    }
    return await drawRoomList(roomList)
}

function getRoomList(roomList: any) {
    const result: Room[] = []
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];

        const tempRoom = new Room({
            number: room.number,
            rawMessage: room.rawMessage,
            source: room.source,
            userId: room.userId,
            time: room.time,
            avanter: room.avanter,
            userName: room.userName
        })
        if (room.player?.id != undefined) {
            let server = room.player.server
            if (isServer(server)) {
                const tempPlayer = new Player(room.player.playerId, server)
                tempPlayer.initFull()
                tempRoom.setPlayer(tempPlayer)
            }
        }
        result.push(tempRoom)
    }
    return result
}



export { router as roomListRouter }