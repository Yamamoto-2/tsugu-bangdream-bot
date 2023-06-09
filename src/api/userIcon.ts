import { downloadFileCache } from "./downloadFileCache";
import { download } from "./downloader";
import { BandoriStationurl,cacheRootPath } from "../config";
import * as path from 'path';

let QQUserIconCahe = {}
export async function getQQUserIcon(Id: number) {
    if (QQUserIconCahe[Id]) {
        return QQUserIconCahe[Id]
    }
    const icon = await download(`https://q1.qlogo.cn/g?b=qq&nk=${Id}&s=640`,path.join(cacheRootPath,'/qqIcon/'),`${Id}.png`,true)
    QQUserIconCahe[Id] = icon
    return icon
}

let BandoriStationUserIconCache = {}
export async function getBandoriStationUserIcon(avatar:string){
    if(BandoriStationUserIconCache[avatar]){
        return BandoriStationUserIconCache[avatar]
    }
    const icon = await download(`https://asset.bandoristation.com/images/user-avatar/${avatar}`,path.join(cacheRootPath,'/asset.bandoristation.com/'),`${avatar}`,false)
    BandoriStationUserIconCache[avatar] = icon
    return icon
}