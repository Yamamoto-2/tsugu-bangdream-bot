import { createCanvas, Canvas, registerFont } from 'canvas';
import { assetsRootPath } from '../config';
import {getTextWidth} from './utils';
registerFont(assetsRootPath + "/Fonts/default.ttf", { family: "default" })

interface RoundedRect {
  width: number,
  height: number,
  radius?: number,
  color?: string,
  opacity?: number,
  strokeColor?: string,
  strokeWidth?: number
}

//画圆角矩形
function drawRoundedRect(
  {
    width,
    height,
    radius = 25,
    color = "#ffffff",
    opacity = 1,
    strokeColor = "#bbbbbb",
    strokeWidth = 2
  }: RoundedRect
): Canvas {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

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

  ctx.globalAlpha = opacity;
  ctx.fillStyle = color
  ctx.fill();

  if (strokeWidth > 0) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;

    ctx.beginPath();
    ctx.moveTo(radius, strokeWidth / 2);
    ctx.lineTo(width - radius, strokeWidth / 2);
    ctx.quadraticCurveTo(width - strokeWidth / 2, strokeWidth / 2, width - strokeWidth / 2, radius);
    ctx.lineTo(width - strokeWidth / 2, height - radius);
    ctx.quadraticCurveTo(width - strokeWidth / 2, height - strokeWidth / 2, width - radius, height - strokeWidth / 2);
    ctx.lineTo(radius, height - strokeWidth / 2);
    ctx.quadraticCurveTo(strokeWidth / 2, height - strokeWidth / 2, strokeWidth / 2, height - radius);
    ctx.lineTo(strokeWidth / 2, radius);
    ctx.quadraticCurveTo(strokeWidth / 2, strokeWidth / 2, radius, strokeWidth / 2);
    ctx.closePath();

    ctx.stroke();
  }

  return canvas;
}



type textAlign = "left" | "right" | "center" | "start" | "end";
interface RoundedRectWithText {
  width?: number,
  height?: number,
  radius?: number,
  color?: string,
  opacity?: number,
  strokeColor?: string,
  strokeWidth?: number
  font?: string,
  text: string,
  textColor?: string,
  textSize: number,
  textAlign?: textAlign
}

//画圆角矩形并填充文字
function drawRoundedRectWithText({
  text,
  font = "default",
  textColor = "#ffffff",
  textSize,
  textAlign = "center",
  height = textSize*4/3,
  width = getTextWidth(text, textSize,font) + height,
  radius = height / 2,
  color = "#5b5b5b",
  opacity = 1,
  strokeColor = color,
  strokeWidth = 0
}: RoundedRectWithText): Canvas {
  const canvas = drawRoundedRect({ width, height, radius, color, opacity, strokeColor, strokeWidth });
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = textColor;
  ctx.textBaseline = "alphabetic";
  ctx.font = `${textSize}px default`;

  let x = 0, y = 0;
  if (textAlign === "left" || textAlign === "start") {
    x = radius;
  } else if (textAlign === "right" || textAlign === "end") {
    x = width - radius;
  }
  else if (textAlign === "center") {
    x = width / 2;
  }

  y = height / 2 + textSize / 3;

  ctx.textAlign = textAlign;
  ctx.fillText(text, x, y);

  return canvas;
}

export { drawRoundedRect, drawRoundedRectWithText };