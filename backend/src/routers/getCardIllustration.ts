import { Card } from "../types/Card";
import { Canvas, createCanvas, Image } from "canvas";
import { listToBase64 } from './utils';
import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
  const { cardId} = req.body;

  if (isNaN(cardId)) {
    res.status(400).send('错误: 卡片ID必须为有效数字');
    return;
  }
  try {
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
  const imageList = []
  for (let i = 0; i < trainingStatusList.length; i++) {
    const element = trainingStatusList[i];
    const Illustration = await card.getCardIllustrationImage(element);
    const tempCanvas = createCanvas(Illustration.width, Illustration.height);
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(Illustration, 0, 0);
    const buffer = tempCanvas.toBuffer("image/png");
    imageList.push(buffer)
  }
  return imageList
}

export { router as cardIllustrationRouter }