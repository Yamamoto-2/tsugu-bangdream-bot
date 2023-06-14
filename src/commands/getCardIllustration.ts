import { Card } from "../types/Card";
import { Canvas, createCanvas, Image } from "canvas";

export async function commandGetCardIllustration(cardId: number): Promise<Array<Buffer | string>> {
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