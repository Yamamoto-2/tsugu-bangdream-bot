import { createCanvas, loadImage, Canvas } from 'canvas';

//将canvas转换为png格式的buffer
 function canvasToBuffer(canvas: Canvas) {
    return canvas.toBuffer('image/png');
}

export { canvasToBuffer };