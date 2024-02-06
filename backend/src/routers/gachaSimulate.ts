import express from 'express';
import { body, validationResult } from 'express-validator';
import { drawRandomGacha } from '@/view/gachaSimulate';
import { Gacha, getPresentGachaList } from '@/types/Gacha';
import { Server } from '@/types/Server';
import { listToBase64, isServer } from '@/routers/utils';

const router = express.Router();

// Route handling the POST request with validation using express-validator
router.post(
  '/',
  [
    body('server_mode').custom((value) => {
      if (!isServer(value)) {
        throw new Error('default_server must be a Server');
      }
      return true;
    }),
    body('status').isBoolean(),
    body('times').optional().isInt(),
    body('compress').isBoolean(),
    body('gachaId').optional().isInt(),
  ],
  async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    // Check for validation errors
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
      return res.send([{ type: 'string', string: '参数错误' }]);
    }

    const { server_mode, status, times, compress, gachaId } = req.body;

    try {
      const result = await commandGachaSimulate(server_mode, status, times, compress, gachaId);
      res.send(listToBase64(result));
    } catch (e) {
      console.log(e);
      res.send([{ type: 'string', string: '内部错误' }]);
    }
  }
);

async function commandGachaSimulate(
  server_mode: Server,
  status: boolean,
  times?: number,
  compress?:boolean,
  gachaId?: number
): Promise<Array<Buffer | string>> {
  let gacha: Gacha;

  if (status) {
    if (!gachaId) {
      const gachaList = await getPresentGachaList(server_mode)
      if (gachaList.length === 0) {
        return ['错误: 该服务器没有正在进行的卡池']
      }
      //获取gachaList中第一个type != 'birthday'的嘎查
      for (let i = 0; i < gachaList.length; i++) {
        const element = gachaList[i];
        if (element.type !== 'birthday') {
          gacha = element
          break
        }
      }
      if (!gacha) {
        return ['错误: 该服务器没有正在进行的卡池']
      }
    } else {
      gacha = new Gacha(gachaId);
      if (!gacha.isExist) {
        return ['错误: 该卡池不存在'];
      }
    }
    return await drawRandomGacha(gacha, times || 10, server_mode, compress);
  }

  return [];
}

export { router as gachaSimulateRouter }