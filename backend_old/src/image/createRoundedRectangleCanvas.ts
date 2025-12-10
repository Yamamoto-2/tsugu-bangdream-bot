import { Canvas, Image, } from 'skia-canvas';

export async function createRoundedRectangleCanvas(input: Canvas | Image, radius: number = 25): Promise<Canvas> {
    let imgCanvas: Canvas;

    imgCanvas = new Canvas(input.width, input.height);
    imgCanvas.getContext('2d').drawImage(input, 0, 0);
    const width = imgCanvas.width;
    const height = imgCanvas.height;
    const outputCanvas = new Canvas(width, height);
    const ctx = outputCanvas.getContext('2d');

    // 绘制圆角矩形
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    // 裁剪并绘制图像
    ctx.clip();
    ctx.drawImage(imgCanvas, 0, 0);

    return outputCanvas;
}
