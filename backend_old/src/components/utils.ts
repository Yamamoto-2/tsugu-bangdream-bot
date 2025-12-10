import { Canvas, Image } from 'skia-canvas';

export function stackImage(list: Array<Image | Canvas>) {
    var maxW = 0
    var allH = 0
    for (var i = 0; i < list.length; i++) {
        if (list[i].width > maxW) {
            maxW = list[i].width
        }
        allH += list[i].height
    }
    var tempcanv = new Canvas(maxW, allH)
    var ctx = tempcanv.getContext("2d")
    var allH2 = 0
    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], 0, allH2)
        allH2 = allH2 + list[i].height
    }
    return (tempcanv)
}

export function stackImageHorizontal(list: Array<Image | Canvas>) {
    var maxH = 0
    var allW = 0
    for (var i = 0; i < list.length; i++) {
        if (list[i].height > maxH) {
            maxH = list[i].height
        }
        allW += list[i].width
    }
    var tempcanv = new Canvas(allW, maxH)
    var ctx = tempcanv.getContext("2d")
    var allW2 = 0
    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], allW2, 0)
        allW2 = allW2 + list[i].width
    }
    return (tempcanv)
}

interface resizeImageOptions {
    image: Image | Canvas,
    heightMax?: number,
    widthMax?: number
}
//输入canvas或Image，高度，宽度，返回等比例缩放到限制高度的canvas
export function resizeImage({
    image,
    heightMax,
    widthMax
}: resizeImageOptions) {
    var height = image.height
    var width = image.width
    if (heightMax != undefined) {
        width = width * heightMax / height
        height = heightMax
    }
    if (widthMax != undefined) {
        height = height * widthMax / width
        width = widthMax
    }
    var canvas = new Canvas(width, height)
    var ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
    return canvas
}
