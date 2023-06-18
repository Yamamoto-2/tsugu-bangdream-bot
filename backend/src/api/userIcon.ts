import * as path from 'path';
import { assetsRootPath } from "../config";
import { Image, loadImage } from 'canvas';
import { download } from './downloader';


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
        const iconPath = await download(imageUrl);
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
        const iconPath = await download(imageUrl);
        const icon = await loadImage(iconPath);
        BandoriStationUserIconCache[avatar] = icon;
        return icon;
    } catch (e) {
        console.log(e)
        const icon = await loadIconUndefined();
        return icon;
    }
}

