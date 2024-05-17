import { Canvas, Image } from 'skia-canvas'
import { drawText } from '@/image/text'
import { assetsRootPath } from '@/config'
import * as path from 'path'
import { loadImageFromPath } from '@/image/utils';


var titleImage: Image
async function loadImageOnce() {
    titleImage = await loadImageFromPath(path.join(assetsRootPath, '/title.png'));
}
loadImageOnce()

export function drawTitle(title1: string, title2: string): Canvas {
    const canvas = new Canvas(titleImage.width, titleImage.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(titleImage, 0, 0)
    var text1 = drawText({ text: title1, maxWidth: 900, lineHeight: 50, textSize: 30, color: '#ffffff', font: 'old' })
    var text2 = drawText({ text: title2, maxWidth: 900, lineHeight: 68, textSize: 40, color: '#5b5b5b', font: 'old' })
    ctx.drawImage(text1, 74, 0)
    ctx.drawImage(text2, 74, 42)
    return canvas
}

