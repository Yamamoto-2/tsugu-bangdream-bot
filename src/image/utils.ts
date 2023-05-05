import { createCanvas, loadImage, Canvas, registerFont } from 'canvas';
import { assetsRootPath } from '../config';
registerFont(assetsRootPath + "/Fonts/default.ttf", { family: "default" })

//指定字体，字号，文本，获取文本宽度
function getTextWidth(text: string, textSize: number,font: string ) {
    const canvas = createCanvas(1, 1);
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Cannot create canvas context");
    }

    context.font = `${textSize}px ${font}`;
    const metrics = context.measureText(text);

    return metrics.width;
}



export { getTextWidth };