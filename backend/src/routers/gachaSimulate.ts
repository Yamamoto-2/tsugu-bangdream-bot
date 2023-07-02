import { drawRandomGacha } from '../view/gachaSimulate';
import { Gacha, getPresentGachaList } from '../types/Gacha';
import { Server } from '../types/Server';
import { listToBase64, isServer } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  console.log(req.baseUrl, req.body)
  
  const { default_server, status, times, gachaId } = req.body;

  // 检查类型是否正确
  if (
    !isServer(default_server) ||
    typeof status !== 'boolean' ||
    (times !== undefined && typeof times !== 'number') ||
    (gachaId !== undefined && typeof gachaId !== 'number')
  ) {
    res.status(404).send('错误: 参数类型不正确');
    return;
  }
  try {
    const result = await commandGachaSimulate(default_server, status, times, gachaId);
    res.send(listToBase64(result));
  } catch (e) {
    console.log(e)
    res.send([{ type: 'string', string: '内部错误' }]);
  }
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
      const gachaList = getPresentGachaList(default_server)
      if(gachaList.length === 0){
        return ['错误: 该服务器没有正在进行的卡池']
      }
      gacha = gachaList[0];
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