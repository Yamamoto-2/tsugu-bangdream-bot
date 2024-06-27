import express from 'express';
import { body } from 'express-validator';
import { Card } from '@/types/Card';
import { listToBase64 } from '@/routers/utils';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/',
  [
    // Define validation rules using express-validator
    body('cardId').isNumeric(),
  ],
  middleware,
  async (req: Request, res: Response) => {

    const { cardId } = req.body;

    try {
      // Ensure cardId is a valid number (no need to check isNaN again)
      const images = await commandGetCardIllustration(cardId);
      res.send(listToBase64(images));
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: 'failed', data: '内部服务器错误' });
    }
  }
);

async function commandGetCardIllustration(cardId: number): Promise<Array<Buffer | string>> {
  let card = new Card(cardId);
  if (!card.isExist) {
    return ['错误: 该卡不存在']
  }
  const trainingStatusList = card.getTrainingStatusList();
  const imageList = [];
  for (let i = 0; i < trainingStatusList.length; i++) {
    const element = trainingStatusList[i];
    const illustration = await card.getCardIllustrationImageBuffer(element);
    // 直接添加插图到列表中，不需要绘制到Canvas
    imageList.push(illustration);
  }
  return imageList;
}

export { router as cardIllustrationRouter }
