import { createCanvas, Canvas } from 'canvas';

interface RoundedRect {
  width: number,
  height: number,
  radius: number,
  opacity: number,
  strokeColor: string,
  strokeWidth: number
}

function drawRoundedRect(
  {
    width,
    height,
    radius,
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

  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
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

export { drawRoundedRect };