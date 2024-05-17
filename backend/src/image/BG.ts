import { createBlurredTrianglePattern } from "@/image/BG/BG_triangle";
import { scatterImages } from "@/image/BG/BG_starScatter";
import { drawTextOnCanvas } from "@/image/BG/BG_text";
import { loadImage, Image, Canvas } from 'skia-canvas';
import { assetsRootPath } from '@/config'
import * as path from 'path';
import { loadImageFromPath } from '@/image/utils';


interface BGOptions {
  image?: Image | Canvas | any;
  text?: string;
  width: number;
  height: number;
}

// 将图片等比例缩放并重复铺满整个画布,并且增加亮度
async function Spread(image: Image, width: number, height: number, brightness: number): Promise<Buffer> {
  const canvas: Canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');

  // 调整亮度
  const brightenedImage = await adjustBrightness(image, brightness);

  // 计算缩放后的尺寸
  const { scaledWidth, scaledHeight } = getScaledDimensions(brightenedImage, width, height);

  // 绘制图像
  for (let y = 0; y < height; y += scaledHeight) {
    for (let x = 0; x < width; x += scaledWidth) {
      ctx.drawImage(brightenedImage, x, y, scaledWidth, scaledHeight);
    }
  }

  return await canvas.toBuffer('png');
}

async function adjustBrightness(image: Image, brightness: number): Promise<Image> {
  const canvas = new Canvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0, image.width, image.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const factor = brightness / 255;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] + 255 * factor);     // Red
    data[i + 1] = Math.min(255, data[i + 1] + 255 * factor); // Green
    data[i + 2] = Math.min(255, data[i + 2] + 255 * factor); // Blue
    // Alpha (data[i + 3]) remains unchanged
  }

  ctx.putImageData(imageData, 0, 0);

  return await loadImage(await canvas.toBuffer('png'));
}

function getScaledDimensions(image: Image, targetWidth: number, targetHeight: number): { scaledWidth: number, scaledHeight: number } {
  const imageAspectRatio = image.width / image.height;
  const canvasAspectRatio = targetWidth / targetHeight;
  let scaledWidth: number, scaledHeight: number;

  if (imageAspectRatio > canvasAspectRatio) {
    scaledWidth = targetWidth;
    scaledHeight = image.height * (targetWidth / image.width);
  } else {
    scaledHeight = targetHeight;
    scaledWidth = image.width * (targetHeight / image.height);
  }

  return { scaledWidth, scaledHeight };
}

var star: Image[] = [];

var defaultBGTexture: Image;
async function loadImageOnce() {
  star.push(await loadImageFromPath(path.join(assetsRootPath, "/BG/star1.png")));
  star.push(await loadImageFromPath(path.join(assetsRootPath, "/BG/star2.png")));
  defaultBGTexture = await loadImageFromPath(path.join(assetsRootPath, "/BG/bg_object_big.png"));
}
loadImageOnce()

export async function CreateBGEazy({
  width, height
}) {
  const bgColor = '#fef3ef'
  const canvas: Canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  if (width < 2000) {
    var ratio = defaultBGTexture.width / width
  }
  else {
    ratio = 1
  }
  //将图片等比例缩放并重复铺满整个画布
  let x = 0,
    y = 0;
  while (y < height) {
    x = 0 - (Math.random() * defaultBGTexture.width * ratio);
    while (x < width) {
      ctx.drawImage(defaultBGTexture, x, y, defaultBGTexture.width * ratio, defaultBGTexture.height * ratio);
      x += defaultBGTexture.width * ratio;
    }
    y += defaultBGTexture.height * ratio;
  }
  return (canvas)
}


export async function CreateBG({
  image,
  text,
  width,
  height,

}: BGOptions): Promise<Canvas> {
  //将图片铺满画面，并且增加20亮度
  const BG = await Spread(image, width, height, 20);
  const BGimage = await loadImage(BG);

  //给图片增加三角形纹理
  const canvas = await createBlurredTrianglePattern({
    image: BGimage,
    blurRadius: 100,
    triangleSize: 200,
    brightnessDifference: 0.04,
  });


  //添加随机星星
  for (let i = 0; i < star.length; i++) {
    await scatterImages({
      canvas,
      image: star[i],
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      density: 0.00001,
      angleRange: 72,
      sizeRange: [25, 75],
    })
  }

  //添加背景文字
  drawTextOnCanvas(canvas, {
    text: text ??= 'BanG Dream!',
    fontSize: 150,
    angle: 15,
    lineSpacing: 50,
    letterSpacing: 100,
    strokeWidth: 3,
    skewAngle: -12,
    opacity: 0.5,
    scaleX: 0.8,
  })
  return (canvas)
}
