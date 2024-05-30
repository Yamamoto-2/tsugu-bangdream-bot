import * as path from 'path';
import { assetsRootPath } from "@/config";
import { Image, loadImage } from 'skia-canvas';
import { download } from '@/api/downloader';
import { loadImageFromPath } from '@/image/utils';

let userIconCache = {};

const iconUndefinedPath = path.join(assetsRootPath, 'iconUndefined.png');
let iconUndefined:Image;
loadImageFromPath(iconUndefinedPath).then((image) => {
    iconUndefined = image;
});

export async function getUserIcon(avatarUrl?:string): Promise<Image> {
    if (!avatarUrl) {
        const icon = iconUndefined
        return icon;
    }
    if (userIconCache[avatarUrl]) {
        return userIconCache[avatarUrl];
    }

    try {
        const iconBuffer = await download(avatarUrl);
        const icon = await loadImage(iconBuffer);
        userIconCache[avatarUrl] = icon;
        return icon;
    } catch (e) {
        console.log(e)
        const icon = iconUndefined
        return icon;
    }
}

