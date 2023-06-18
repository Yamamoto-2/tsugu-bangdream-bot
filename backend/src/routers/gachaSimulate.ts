import { drawRandomGacha } from '../view/gachaSimulate';
import { Gacha, getPresentGachaList } from '../types/Gacha';
import { Server } from '../types/Server';
import { listToBase64, isServer } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  const { default_server, status, times, gachaId } = req.body;

  // 检查类型是否正确
  if (
    !isServer(default_server) ||
    typeof status !== 'boolean' ||
    (times !== undefined && typeof times !== 'number') ||
    (gachaId !== undefined && typeof gachaId !== 'number')
  ) {
    res.status(400).send('错误: 参数类型不正确');
    return;
  }

  const result = await commandGachaSimulate(default_server, status, times, gachaId);
  res.send(listToBase64(result));
});

async function commandGachaSimulate(
  default_server: Server,
  status: boolean,
  times?: number,
  gachaId?: number
): Promise<Array<Buffer | string>> {
  let gacha: Gacha;

  if (status) {
    if (!gachaId) {
      gacha = getPresentGachaList(default_server)[0];
    } else {
      gacha = new Gacha(gachaId);
      if (!gacha.isExist) {
        return ['错误: 该卡池不存在'];
      }
    }
    return await drawRandomGacha(gacha, times || 10, default_server);
  }

  return [];
}

export { router as gachaSimulateRouter }