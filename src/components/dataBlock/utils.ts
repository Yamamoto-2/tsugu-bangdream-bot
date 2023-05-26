import {Image, createCanvas, Canvas} from 'canvas'
export function draweventBannerImageCanvas(eventBannerImage: Image): Canvas {
    var ratio = 800 / eventBannerImage.width
    var eventBannerImageCanvas = createCanvas(800, eventBannerImage.height * ratio)
    var ctx = eventBannerImageCanvas.getContext('2d')
    ctx.drawImage(eventBannerImage, 0, 0, 800, eventBannerImage.height * ratio)
    return eventBannerImageCanvas
}