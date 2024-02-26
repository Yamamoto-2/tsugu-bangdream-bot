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
    body('server').custom(isServer),
    // body('status').isBoolean(),
    // body('times').optional().isInt(),
    body('text').optional().isString(),
    body('compress').optional().isBoolean(),
    // body('gachaId').optional().isInt(),
  ],
  async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    // Check for validation errors
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
      return res.send([{ type: 'string', string: '参数错误' }]);
    }

    const { server, text, compress } = req.body;

    try {
      const result = await commandGachaSimulate(server, text, compress);
      res.send(listToBase64(result));
    } catch (e) {
      console.log(e);
      res.send([{ type: 'string', string: '内部错误' }]);
    }
  }
);

async function commandGachaSimulate(
  server: Server,
  text: string,
  compress: boolean
): Promise<Array<Buffer | string>> {
  let gacha: Gacha;
  let times: number = 10; // 默认抽卡次数
  let gachaId: number | undefined;

  // 清理text参数
  text = text.trim();
  if (text !== '') {
    const params = text.split(/\s+/);
    times = parseInt(params[0], 10) || 10; // 解析抽卡次数，如果无效则默认为10
    if (params.length === 2) {
      gachaId = parseInt(params[1], 10); // 尝试解析卡池ID
    }
  }

  if (text === '' || !gachaId) {
    // 未提供卡池ID，选择当前活动卡池
    const gachaList = await getPresentGachaList(server);
    if (gachaList.length === 0) {
      return ['错误: 该服务器没有正在进行的卡池'];
    }
    // 选取第一个非生日类型的卡池
    const activeGacha = gachaList.find(gacha => gacha.type !== 'birthday');
    if (!activeGacha) {
      return ['错误: 该服务器没有符合条件的卡池'];
    }
    gacha = activeGacha;
  } else {
    // 用户指定了卡池ID
    gacha = new Gacha(gachaId);
    if (!gacha.isExist) {
      return ['错误: 该卡池不存在'];
    }
  }

  // 进行抽卡模拟
  return await drawRandomGacha(gacha, times, server, compress);
}



export { router as gachaSimulateRouterV2 };