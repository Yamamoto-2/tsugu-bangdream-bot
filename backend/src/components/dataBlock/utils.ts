import { Image, Canvas } from 'skia-canvas'
import { resizeImage } from '@/components/utils'
export function drawBannerImageCanvas(eventBannerImage: Image): Canvas {
    return resizeImage({
        image: eventBannerImage,
        widthMax: 800
    })
}