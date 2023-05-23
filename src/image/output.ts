import { Canvas, Image, createCanvas, loadImage } from 'canvas';
import { CreateBG } from './BG';

import { assetsRootPath } from '../config';
import * as path from 'path';
var defaultBG:Image
async function loadImageOnce(){
    defaultBG = await loadImage(path.join(assetsRootPath, "/BG/default.png"));
}
loadImageOnce()

//将图片列表从上到下叠在一起输出为一张图片
export var outputFinalCanv = async function (imageList: Array<Image | Canvas>, text: string = 'BanG Dream!', BGimage?: Image | Canvas): Promise<Canvas> {
    BGimage ??= defaultBG
    var allH = 70
    var maxW = 0
    for (var i = 0; i < imageList.length; i++) {
        allH = allH + imageList[i].height
        allH += 30
        if (imageList[i].width > maxW) {
            maxW = imageList[i].width
        }
    }
    var tempcanv = createCanvas(1000, allH)
    var ctx = tempcanv.getContext("2d")

    ctx.drawImage(await CreateBG({
        text,
        image: BGimage,
        width: maxW,
        height: allH
    }), 0, 0)

    var allH2 = 50
    for (var i = 0; i < imageList.length; i++) {
        ctx.drawImage(imageList[i], 0, allH2)
        allH2 = allH2 + imageList[i].height
        allH2 += 30
    }

    return (tempcanv)
}

//输出为二进制流
export var outputFinalBuffer = async function (imageList: Array<Image | Canvas>, text: string = 'BanG Dream!', BGimage?: Image | Canvas): Promise<Buffer> {
    var tempcanv = await outputFinalCanv(imageList, text, BGimage)
    var tempBuffer = tempcanv.toBuffer()
    return (tempBuffer)
}
