import { createCanvas, registerFont, Canvas, CanvasRenderingContext2D } from 'canvas';
import { assetsRootPath } from '../config';
registerFont(assetsRootPath + "/Fonts/default.ttf", { family: "default" })

interface warpTextOptions {
    text: string,
    textSize?: number,
    maxWidth: number,
    lineHeight?: number
}

//画文字,自动换行
function drawText({
    text,
    textSize = 40,
    maxWidth,
    lineHeight = textSize * 4 / 3
}: warpTextOptions): Canvas {
    var wrappedTextData = wrapText({ text, maxWidth, lineHeight, textSize });
    const canvas = createCanvas(maxWidth, lineHeight * wrappedTextData.numberOfLines);
    const ctx = canvas.getContext('2d');
    let y = lineHeight / 2 + textSize / 3
    ctx.textBaseline = 'alphabetic'
    setFontStyle(ctx, textSize, "default");
    ctx.fillStyle = '#5b5b5b';
    var wrappedText = wrappedTextData.wrappedText
    for (var i = 0; i < wrappedText.length; i++) {
        ctx.fillText(wrappedText[i], 0, y);
        y += lineHeight;
    }
    return canvas;
}

function wrapText({
    text,
    textSize,
    maxWidth,
    lineHeight
}: warpTextOptions) {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    const temp = text.split('\n');
    ctx.textBaseline = 'alphabetic';
    setFontStyle(ctx, textSize, "default");
    const wrappedLines = [];

    for (var i = 0; i< temp.length; i++) {
        let temptext = temp[i]
        let a = 0
        for (var n = 0; n < temptext.length; n++) {
            if (maxWidth > ctx.measureText(temptext.slice(0, temptext.length - n)).width) {
                a = n
                break
            }

        }
        if (a != 0) {
            temp.splice(i + 1, 0, temp[i].slice(temp[i].length - a, temp[i].length))
            temp[i] = temp[i].slice(0, temp[i].length - a)
        }
    }

    for (var i = 0; i < temp.length; i++) {
        if (temp[i] == "") {
            temp.splice(i, 1);
            //去除空值
            i--;
        }
    }
    return {
        numberOfLines: temp.length,
        wrappedText: temp,
    };
}

var setFontStyle = function (ctx: CanvasRenderingContext2D, textSize: number, font: string) {//设置字体大小
    ctx.font = textSize + 'px ' + font + ",Microsoft Yahei"
}

export { drawText, wrapText }