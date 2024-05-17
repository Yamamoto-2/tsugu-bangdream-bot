import { Canvas } from 'skia-canvas';

interface DrawDottedLineOptions {
  width: number;
  height: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  radius: number;
  gap: number;
  color: string;
}

export function drawDottedLine(options: DrawDottedLineOptions): Canvas {
  const { width, height, startX, startY, endX, endY, radius, gap, color } = options;

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');

  // Calculate the total length of the line
  const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

  // Calculate the number of dots
  const numberOfDots = Math.floor(lineLength / (radius * 2 + gap));

  // Calculate the step size for the x and y coordinates
  const stepX = (endX - startX) / numberOfDots;
  const stepY = (endY - startY) / numberOfDots;

  // Draw the dots
  ctx.fillStyle = color;
  for (let i = 0; i <= numberOfDots; i++) {
    const x = startX + stepX * i;
    const y = startY + stepY * i;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

