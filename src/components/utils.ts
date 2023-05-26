import { Canvas, Image, createCanvas } from 'canvas';
export function stackImage (list:Array<Image|Canvas>){
    var maxW = 0
    var allH = 0
    for (var i = 0; i < list.length; i++) {
        if (list[i].width > maxW) {
            maxW = list[i].width
        }
        allH += list[i].height
    }
    var tempcanv = createCanvas(maxW, allH)
    var ctx = tempcanv.getContext("2d")
    var allH2 = 0
    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], 0, allH2)
        allH2 = allH2 + list[i].height
    }
    return (tempcanv)
}