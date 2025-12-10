import * as fs from 'fs';
import * as path from 'path';
import { Canvas, loadImage, Image } from 'skia-canvas';
import svg2img from 'svg2img';

const assetsRootPath: string = path.join(__dirname, '../../assets');

export const assetErrorImageBuffer = fs.readFileSync(`${assetsRootPath}/err.png`)

export async function loadImageFromPath(path: string): Promise<Image> {
    //判断文件是否存在
    if (!fs.existsSync(path)) {
        return loadImage(assetErrorImageBuffer);
    }
    const buffer = fs.readFileSync(path);
    return await loadImage(buffer);
}


//指定字体，字号，文本，获取文本宽度
export function getTextWidth(text: string, textSize: number, font: string) {
    const canvas = new Canvas(1, 1);
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Cannot create canvas context");
    }

    context.font = `${textSize}px ${font}`;
    const metrics = context.measureText(text);

    return metrics.width;
}

export function convertSvgToPngBuffer(svgBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // 将 SVG buffer 转换为字符串
      const svgString = svgBuffer.toString('utf-8');
  
      // 使用 svg2img 将 SVG 字符串转换为 PNG buffer
      svg2img(svgString, (error, buffer) => {
        if (error) {
          return reject(new Error(`Failed to convert SVG to PNG: ${error.message}`));
        }
        resolve(buffer);
      });
    });
  }