import express from 'express';
import { body } from 'express-validator';
import { drawRandomGacha } from '@/view/gachaSimulate';
import { Gacha, getPresentGachaList } from '@/types/Gacha';
import { getServerByServerId, Server } from '@/types/Server';
import { listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

// Route handling the POST request with validation using express-validator
router.post(
  '/',
  [
    body('mainServer').custom((value) => {
      if (!isServer(value)) {
        throw new Error('mainServer must be a Server');
      }
      return true;
    }),
    body('times').optional().isInt(),
    body('compress').optional().isBoolean(),
    body('gachaId').optional().isInt(),
  ],
  middleware,
  async (req: Request, res: Response) => {

    const { mainServer, times, compress, gachaId } = req.body;

    try {
      const result = await commandGachaSimulate(getServerByServerId(mainServer), times, compress, gachaId);
      res.send(listToBase64(result));
    } catch (e) {
      console.log(e);
      res.status(500).send({ status: 'failed', data: '内部错误' });
    }
  }
);

async function commandGachaSimulate(
  mainServer: Server,
  times?: number,
  compress?: boolean,
  gachaId?: number
): Promise<Array<Buffer | string>> {
  let gacha: Gacha;


  if (!gachaId) {
    const gachaList = await getPresentGachaList(mainServer)
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
  return await drawRandomGacha(gacha, times || 10, compress);

}

export { router as gachaSimulateRouter }