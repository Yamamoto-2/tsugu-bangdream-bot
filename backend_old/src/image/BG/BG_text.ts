import { Canvas, FontLibrary} from 'skia-canvas';
import { assetsRootPath } from '@/config';

FontLibrary.use("Orbitron", [`${assetsRootPath}/Fonts/Orbitron Black.ttf`])

interface DrawTextOptions {
  text: string;
  fontSize: number;
  angle: number;
  lineSpacing: number;
  letterSpacing: number;
  strokeWidth?: number;
  skewAngle?: number;
  opacity?: number;
  scaleX?: number;
  overflow?: number;
  offsetY?: number;
}

export function drawTextOnCanvas(
  canvas: Canvas,
  { text,  fontSize, angle, lineSpacing, letterSpacing, strokeWidth = 1, skewAngle = 0, opacity = 1, scaleX = 1, overflow = 100, offsetY = 0 }: DrawTextOptions
) {
  const ctx = canvas.getContext('2d');

  // 设置字体样式
  ctx.font = `${fontSize}px Orbitron`;
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = 'white';

  // 将坐标系原点移到画布中央
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // 缩放坐标系
  ctx.scale(scaleX, 1);

  // 计算字体在旋转后的宽度和高度
  const metrics = ctx.measureText(text);
  const rotatedWidth =
    Math.abs(Math.cos((angle * Math.PI) / 180)) * metrics.width +
    Math.abs(Math.sin((angle * Math.PI) / 180)) * fontSize;
  const rotatedHeight =
    Math.abs(Math.sin((angle * Math.PI) / 180)) * metrics.width +
    Math.abs(Math.cos((angle * Math.PI) / 180)) * fontSize;

  // 计算列数和行数
  const numCols = Math.ceil((canvas.width + overflow * 2) / (rotatedWidth + letterSpacing));
  const numRows = Math.ceil((canvas.height + overflow * 2) / (rotatedHeight + lineSpacing));

  // 进行斜切操作
  ctx.transform(1, 0, Math.tan((skewAngle * Math.PI) / 180), 1, 0, 0);

  // 设置透明度
  ctx.globalAlpha = opacity;

  // 循环绘制每一行的文本
  for (let i = 0; i <= numRows; i++) { // 将行数循环次数增加 1，以添加额外一行

    // 计算每一行的起始位置
    const startY = i * (rotatedHeight + lineSpacing) - canvas.height / 2 - offsetY;

    // 将坐标系旋转到正确的位置
    ctx.rotate((-angle * Math.PI) / 180);

    // 计算每一行文本的起始位置，并添加偏移量
    const startX = -(numCols / 2) * (rotatedWidth + letterSpacing) + (rotatedWidth +letterSpacing) / 2 + overflow + (i % 2) * ((rotatedWidth + letterSpacing) / 2);
// 循环绘制每一列的文本
for (let j = 0; j < numCols; j++) {

    // 计算每一列的起始位置
    const x = startX + j * (rotatedWidth + letterSpacing);
  
    // 将坐标系原点移到当前列的起始位置
    ctx.translate(x, startY);
  
    // 设置描边粗细度
    ctx.lineWidth = strokeWidth;
  
    // 控制文本对齐方式
    ctx.textAlign = 'center';
  
    // 绘制文本的描边效果
    ctx.strokeText(text, 0, 0);
  
    // 将坐标系恢复到当前列的起始位置
    ctx.translate(-x, -startY);
  }
  
  // 恢复坐标系的旋转
  ctx.rotate((angle * Math.PI) / 180);
}

// 恢复坐标系的斜切操作
ctx.transform(1, 0, -Math.tan((skewAngle * Math.PI) / 180), 1, 0, 0);

// 恢复透明度
ctx.globalAlpha = 1;

// 恢复缩放操作
ctx.scale(1 / scaleX, 1);
}
