import { drawRoomList } from '@/view/roomList';
import { listToBase64, isServer } from '@/routers/utils';
import { Room } from '@/types/Room';
import { Player } from '@/types/Player';
import { getServerByServerId } from '@/types/Server';
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post('/', [
  // Define validation rules for the request body
  body('roomList').isArray().notEmpty(),
  body('compress').optional().isBoolean(),
], async (req, res) => {
  console.log(req.ip,`${req.baseUrl}${req.path}`, JSON.stringify(req.body));

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send([{ type: 'string', string: '车牌格式错误' }]);
  }

  const { roomList, compress } = req.body;
  let tempRoomlist: Room[];
  // 检查类型是否正确
  try {
    tempRoomlist = getRoomList(roomList);
  } catch (e) {
    console.log(req.url + ' ' + req.body);
    res.send([{ type: 'string', string: '车牌格式错误' }]);
    return;
  }
  try {
    const result = await commandRoomList(tempRoomlist, compress);
    res.send(listToBase64(result));
  } catch (e) {
    console.log(e);
    res.send([{ type: 'string', string: '内部错误' }]);
  }
});

export async function commandRoomList(roomList: Room[], compress:boolean): Promise<Array<string | Buffer>> {
    if (roomList.length == 0) {
        return ['myc']
    }
    return await drawRoomList(roomList, compress)
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
                const tempPlayer = new Player(room.player.id, getServerByServerId(server))
                tempPlayer.initFull(false)
                tempRoom.setPlayer(tempPlayer)
            }
        }
        result.push(tempRoom)
    }
    return result
}



export { router as roomListRouter }