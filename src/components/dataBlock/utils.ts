import { Image, createCanvas, Canvas } from 'canvas'
import { resizeImage } from '../utils'
export function draweventBannerImageCanvas(eventBannerImage: Image): Canvas {
    return resizeImage({
        image: eventBannerImage,
        widthMax: 800
    })
}