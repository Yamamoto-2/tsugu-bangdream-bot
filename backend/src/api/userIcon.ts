import * as path from 'path';
import { assetsRootPath } from "@/config";
import { Image, loadImage } from 'skia-canvas';
import { download } from '@/api/downloader';
import { loadImageFromPath } from '@/image/utils';

let QQUserIconCache = {};

const iconUndefinedPath = path.join(assetsRootPath, 'iconUndefined.png');
const iconUndefined = loadImageFromPath(iconUndefinedPath);

export async function getQQUserIcon(Id: number): Promise<Image> {
    if (QQUserIconCache[Id]) {
        return QQUserIconCache[Id];
    }

    try {
        const imageUrl = `https://q1.qlogo.cn/g?b=qq&nk=${Id}&s=640`;
        const filename = `${Id}.png`;
        const iconBuffer = await download(imageUrl);
        const icon = await loadImage(iconBuffer);
        QQUserIconCache[Id] = icon;
        return icon;
    } catch (e) {
        console.log(e)
        const icon = iconUndefined
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
        const iconBuffer = await download(imageUrl);
        const icon = await loadImage(iconBuffer);
        BandoriStationUserIconCache[avatar] = icon;
        return icon;
    } catch (e) {
        console.log(e)
        const icon = iconUndefined
        return icon;
    }
}

