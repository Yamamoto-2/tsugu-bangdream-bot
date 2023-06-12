import * as fs from 'fs';
import * as path from 'path';
import { assetsRootPath, cacheRootPath } from "../config";
import { Image, loadImage } from 'canvas';
import https from 'https';

async function loadIconUndefined(): Promise<Image> {
    const iconPath = path.join(assetsRootPath, 'iconUndefined.png');
    const icon = await loadImage(iconPath);
    return icon;
}

let QQUserIconCache = {};

export async function getQQUserIcon(Id: number): Promise<Image> {
    if (QQUserIconCache[Id]) {
        return QQUserIconCache[Id];
    }

    try {
        const imageUrl = `https://q1.qlogo.cn/g?b=qq&nk=${Id}&s=640`;
        const filename = `${Id}.png`;
        const iconPath = await download(imageUrl, path.join(cacheRootPath, 'qqIcon'), filename, true);
        const icon = await loadImage(iconPath);
        QQUserIconCache[Id] = icon;
        return icon;
    } catch (e) {
        console.log(e)
        const icon = await loadIconUndefined();
        return icon;
    }
}

let BandoriStationUserIconCache = {};

export async function getBandoriStationUserIcon(avatar: string): Promise<Image> {
    if (BandoriStationUserIconCache[avatar]) {
        return BandoriStationUserIconCache[avatar];
    }

    try {
        const imageUrl = `https://asset.bandoristation.com/images/user-avatar/${avatar}`;
        const iconPath = await download(imageUrl, path.join(cacheRootPath, 'asset.bandoristation.com'), avatar, true);
        const icon = await loadImage(iconPath);
        BandoriStationUserIconCache[avatar] = icon;
        return icon;
    } catch (e) {
        console.log(e)
        const icon = await loadIconUndefined();
        return icon;
    }
}

function download(url: string, outputDir: string, filename: string, overwrite: boolean): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(outputDir, filename);
  
      // 检查文件是否已存在
      const fileExists = fs.existsSync(filePath);
      if (fileExists && !overwrite) {
        const fileData = fs.readFileSync(filePath);
        resolve(fileData);
        return;
      }
  
      https.get(url, (response: any) => {
        const chunks: any[] = [];
        response.on('data', (chunk: any) => {
          chunks.push(chunk);
        });
  
        response.on('end', () => {
          const fileData = Buffer.concat(chunks);
          fs.writeFileSync(filePath, fileData);
          resolve(fileData);
        });
      }).on('error', (err: any) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
    });
  }