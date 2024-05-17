import { Canvas, Image } from 'skia-canvas'
import { drawText } from "@/image/text"
import { resizeImage } from "@/components/utils"

const line2 = new Canvas(1000, 3)
const ctx2 = line2.getContext('2d')
ctx2.fillStyle = '#ababab'
ctx2.fillRect(50, 0, 420, 3)

interface drawTipsConfig {
    text: string,
    image?: Image,
    maxWidth?: number,
}

export function drawTips({
    text,
    image,
    maxWidth = 900,
}: drawTipsConfig): Canvas {//下方指令提示
    let textMaxWidth = maxWidth
    if (image) {
        textMaxWidth -= 250
    }
    //文字
    const textImage = drawText({
        text,
        maxWidth: textMaxWidth,
        textSize: 30,
        color: '#505050',
    })
    let height = textImage.height
    //图片
    let imageCanvas: Canvas
    if (image) {
        imageCanvas = resizeImage({
            image,
            widthMax: 250
        })
        height = Math.max(textImage.height, imageCanvas.height)
    }
    const canvas = new Canvas(maxWidth + 100, height + 20)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(line2, 0, 0)
    ctx.drawImage(textImage, 50, 20)
    if (image) {
        ctx.drawImage(imageCanvas, maxWidth - 200, 20)
    }
    return canvas
}