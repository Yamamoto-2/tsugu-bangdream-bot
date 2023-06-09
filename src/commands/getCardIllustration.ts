import { Card } from "../types/Card";
import { Canvas, createCanvas, Image } from "canvas";
import { h, Schema, Context, Session } from "koishi";

export async function commandGetCardIllustration(session:Session,cardId: number) {
    let card = new Card(cardId);
    if (!card.isExist) {
        return '错误: 该卡不存在'
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
        imageList.push(h.image(buffer, 'image/png'))
    }
    return imageList
}