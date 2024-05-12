import express from 'express';
import { body, validationResult } from 'express-validator';
import { Room, queryAllRoom } from '@/types/Room';
import { drawRoomList } from '@/view/roomList';
import { listToBase64 } from '@/routers/utils';

const router = express.Router();

router.post('/', [
  body('compress').optional().isBoolean(),
], async (req, res) => {
  console.log(req.ip, `${req.baseUrl}${req.path}`, JSON.stringify(req.body));

  // 验证请求体
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send([{ type: 'string', string: '参数错误' }]);
  }

  const { compress = false } = req.body; // 默认不压缩

  try {
    const tempRoomList: Room[] = await queryAllRoom();
    console.log('tempRoomList', tempRoomList);

    if (tempRoomList.length === 0) {
      res.send([{ type: 'string', string: 'myc' }]);
    }

    const commandResult = await commandRoomList(tempRoomList, compress);
    const base64Result = listToBase64(commandResult); // 将结果转换为Base64
    res.send(base64Result); // 发送转换后的结果
  } catch (e) {
    console.error(e);
    res.status(500).send([{ type: 'string', string: '内部错误' }]);
  }
});

async function commandRoomList(roomList: Room[], compress: boolean): Promise<Array<string | Buffer>> {
  // 如果房间列表为空，返回预定义消息
  if (roomList.length === 0) {
    return ['没有可用的房间'];
  }
  // 使用drawRoomList处理房间列表
  return await drawRoomList(roomList, compress);
}

export { router as ycmV2 };
