import { Costume } from "@/types/Costume";
import { Card } from "@/types/Card";
import { Canvas } from 'skia-canvas';
import { drawList } from '@/components/list'

export async function drawSdcharaInList(card: Card): Promise<Canvas> {
    const costumeId = card.costumeId
    const costume = new Costume(costumeId)
    await costume.initFull()
    var sdcharaImage = await costume.getSdchara()
    //从高度84开始，把sdCharaImage切成田字形的四分，大小都为400*470
    var sdcharaImageList: Array<Canvas> = []
    for (let i = 0; i < 4; i++) {
        const canvas = new Canvas(400, 470);
        const context = canvas.getContext('2d');
        const x = i % 2 === 0 ? 0 : 400;
        const y = i < 2 ? 84 : 554;

        context.drawImage(sdcharaImage, x, y, 400, 470, 0, 0, 400, 470);
        sdcharaImageList.push(canvas);
    }
    return drawList({
        key: '演出缩略图',
        content: sdcharaImageList,
        lineHeight: 470 / 400 * 190,
        textSize: 470 / 400 * 190,
        spacing: 0
    })
}
