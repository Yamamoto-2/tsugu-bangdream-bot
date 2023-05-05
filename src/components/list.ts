import { Canvas, Image, createCanvas } from 'canvas';
import { drawRoundedRectWithText, drawRoundedRect } from '../image/drawRect';
import { drawText } from './text';
import { drawDottedLine } from '../image/dottedLine'

//表格用默认虚线
var line: Canvas = drawDottedLine({
    width: 1000,
    height: 30,
    startX: 100,
    startY: 15,
    endX: 900,
    endY: 15,
    radius: 2,
    gap: 10,
    color: "#f1f1f1"
})

//画表格中的一行
function drawList(key: string, text: string, text2?: string, textSize = 40): Canvas {
    const xmax = 800
    const keyImage = drawRoundedRectWithText({
        text: key,
        textSize: textSize * 3 / 4
    });
    const lineHeight = textSize * 1.5;
    const textImage = drawText({ text, maxWidth: xmax, lineHeight });
    var ymax = textImage.height + keyImage.height;
    if (text2) {
        const textImage2 = drawText({ text: text2, maxWidth: xmax, lineHeight: lineHeight * 3 / 4, textSize: textSize * 3 / 4 });
        ymax += textImage2.height;
        const canvas = createCanvas(1000, ymax);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(keyImage, 100, 0);
        ctx.drawImage(textImage, 100, keyImage.height);
        ctx.fillStyle = '#f1f1f1'
        ctx.fillRect(100, keyImage.height + textImage.height, xmax, textImage2.height);
        ctx.drawImage(textImage2, 100, keyImage.height + textImage.height);
        return canvas;
    }
    else {
        const canvas = createCanvas(1000, ymax - ((lineHeight-textSize)/2));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(keyImage, 100, 0);
        ctx.drawImage(textImage, 100, keyImage.height);
        return canvas;
    }

}

//组合表格子程序，使用block当做底，通过最大高度换行，默认高度无上限
var drawDatablock = async function (list: Array<Image | Canvas>): Promise<Canvas> {
    var allH = 100
    for (var i = 0; i < list.length; i++) {
        allH = allH + list[i].height
    }
    var tempcanv = createCanvas(1000, allH)
    var ctx = tempcanv.getContext("2d")

    ctx.drawImage(drawRoundedRect({
        width: 900,
        height: allH
    }), 50, 0)

    var allH2 = 50
    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], 0, allH2)
        allH2 = allH2 + list[i].height
    }

    return (tempcanv)
}



export { drawList, drawDatablock, line };
