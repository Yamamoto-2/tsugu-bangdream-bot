import { Canvas, Image } from 'skia-canvas';


interface ScatterProps {
  canvas: Canvas;
  image: Image;
  canvasWidth: number;
  canvasHeight: number;
  density: number;
  angleRange: number;
  sizeRange: [number, number];
}

//随机在canvas中散布星星(arisa)
export async function scatterImages({
  canvas,
  image,
  canvasWidth,
  canvasHeight,
  density,
  angleRange,
  sizeRange,
}: ScatterProps) {
  const ctx = canvas.getContext('2d');

  // Load images


  // Calculate number of images to scatter
  const area = canvasWidth * canvasHeight;
  const numImages = Math.floor(area * density);

  // Scatter images randomly
  for (let i = 0; i < numImages; i++) {
    // Randomly select image


    // Randomly select position and size
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];

    // Randomly select rotation angle
    const angle = Math.random() * angleRange * Math.PI / 180;

    // Save current canvas state
    ctx.save();

    // Translate to center of image
    ctx.translate(x, y);

    // Rotate by random angle
    ctx.rotate(angle);

    // Draw image with random size
    ctx.drawImage(image, -size / 2, -size / 2, size, size);

    // Restore previous canvas state
    ctx.restore();
  }

  // Return base64-encoded PNG image
  return canvas.toDataURL('png');
}
