import { createCanvas, loadImage, Canvas } from 'canvas';
import { Image } from 'canvas';

function canvas2image(canvas: Canvas): Promise<Image> {
  const buffer: Buffer = canvas.toBuffer('image/png');
  const image: Image = new Image();
  image.src = buffer;
  return new Promise<Image>((resolve, reject) => {
    loadImage(buffer).then((img: Image) => {
      resolve(img);
    }).catch((err: Error) => {
      reject(err);
    });
  });
}

export { canvas2image };
