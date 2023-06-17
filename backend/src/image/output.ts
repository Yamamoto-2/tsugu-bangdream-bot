import { Canvas, Image, createCanvas, loadImage } from 'canvas';
import { CreateBG, CreateBGEazy } from './BG';
import { assetsRootPath } from '../config';
import * as path from 'path';
var BGDefaultImage: Image
async function loadImageOnce() {
    BGDefaultImage = await loadImage(path.join(assetsRootPath, "/BG/live.png"));
}
loadImageOnce()

interface outputFinalOptions {
    startWithSpace?: boolean;
    imageList: Array<Image | Canvas>;
    useEasyBG?: boolean;
    text?: string;
    BGimage?: Image | Canvas;
}

//将图片列表从上到下叠在一起输出为一张图片
export var outputFinalCanv = async function ({ imageList,
    startWithSpace = true,
    useEasyBG = true,
    text = 'BanG Dream!',
    BGimage = BGDefaultImage
}: outputFinalOptions
): Promise<Canvas> {
    let allH = 30
    if(startWithSpace){
        allH += 50
    }
    var maxW = 0
    for (var i = 0; i < imageList.length; i++) {
        allH = allH + imageList[i].height
        allH += 30
        if (imageList[i].width > maxW) {
            maxW = imageList[i].width
        }
    }
    var tempcanv = createCanvas(maxW, allH)
    var ctx = tempcanv.getContext("2d")

    if ( useEasyBG) {
        ctx.drawImage(await CreateBGEazy({
            width: maxW,
            height: allH
        }), 0, 0)
    }
    else {
        ctx.drawImage(await CreateBG({
            text,
            image: BGimage,
            width: maxW,
            height: allH
        }), 0, 0)
    }


    let allH2 = 0
    if(startWithSpace){
        allH2 += 50
    }
    for (var i = 0; i < imageList.length; i++) {
        ctx.drawImage(imageList[i], 0, allH2)
        allH2 = allH2 + imageList[i].height
        allH2 += 30
    }

    return (tempcanv)
}



//输出为二进制流
export var outputFinalBuffer = async function ({
    startWithSpace = true,
    imageList,
    useEasyBG = true,
    text,
    BGimage
}: outputFinalOptions): Promise<Buffer> {
    var tempcanv = await outputFinalCanv({
        startWithSpace,
        imageList,
        useEasyBG,
        text,
        BGimage
    })
    var tempBuffer = tempcanv.toBuffer()
    return (tempBuffer)
}
