import express from 'express';
import { body, validationResult } from 'express-validator';
import { Card } from '@/types/Card';
import { createCanvas } from 'canvas';
import { listToBase64 } from '@/routers/utils';

const router = express.Router();

router.post('/', [
  // Define validation rules using express-validator
  body('cardId').isNumeric().withMessage('cardId must be a number'),
], async (req, res) => {
  console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send([{ type: 'string', string: '参数错误' }]);
  }

  const { cardId } = req.body;

  try {
    // Ensure cardId is a valid number (no need to check isNaN again)
    const images = await commandGetCardIllustration(cardId);
    res.send(listToBase64(images));
  } catch (error) {
    res.status(500).send('内部服务器错误');
  }
});

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
