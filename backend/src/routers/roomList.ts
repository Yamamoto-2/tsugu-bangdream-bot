import { drawRoomList } from '@/view/roomList';
import { listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';
import { Room } from '@/types/Room';
import { Player } from '@/types/Player';
import { getServerByServerId } from '@/types/Server';
import express from 'express';
import { body } from 'express-validator';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/',
  [
    // Define validation rules for the request body
    body('roomList').isArray().notEmpty(),
    body('compress').optional().isBoolean(),
  ],
  middleware,
  async (req: Request, res: Response) => {

    const { roomList, compress } = req.body;
    let tempRoomlist: Room[];
    // 检查类型是否正确
    try {
      tempRoomlist = getRoomList(roomList);
    } catch (e) {
      console.log(req.url + ' ' + req.body);
      res.status(422).send({ status: 'failed', data: '车牌格式错误' });
      return;
    }
    try {
      const result = await commandRoomList(tempRoomlist, compress);
      res.send(listToBase64(result));
    } catch (e) {
      console.log(e);
      res.status(500).send({ status: 'failed', data: '内部错误' });
    }
  }
);

export async function commandRoomList(roomList: Room[], compress: boolean): Promise<Array<string | Buffer>> {
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
      avatarUrl: room.avatarUrl,
      userName: room.userName
    })
    if (room.player?.playerId != undefined) {
      let server = room.player.server
      if (isServer(server)) {
        const tempPlayer = new Player(room.player.playerId, server)
        tempPlayer.initFull(true)
        tempRoom.setPlayer(tempPlayer)
      }
    }
    result.push(tempRoom)
  }
  return result
}



export { router as roomListRouter }