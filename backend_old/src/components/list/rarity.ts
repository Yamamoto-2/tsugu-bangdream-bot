import { Canvas, Image } from 'skia-canvas'
import { drawList } from '@/components/list'
import { assetsRootPath } from '@/config'
import * as path from 'path'
import { loadImageFromPath } from '@/image/utils';

interface RarityInListOptions {
    key?: string;
    rarity: number,
    trainingStatus: boolean,
    text?: string
}

export let starList: { [type: string]: Image } = {}
async function loadImageOnce() {
    starList.normal = await loadImageFromPath(path.join(assetsRootPath, '/Card/star.png'));
    starList.trained = await loadImageFromPath(path.join(assetsRootPath, '/Card/star_trained.png'));
}
loadImageOnce()

export async function drawRarityInList({
    key,
    rarity,
    trainingStatus = true,
    text
}: RarityInListOptions): Promise<Canvas> {
    var content: Array<string | Image | Canvas> = []
    var star: Image
    if (rarity > 3 && trainingStatus) {
        star = starList.trained
    }
    else {
        star = starList.normal
    }
    for (let i = 0; i < rarity; i++) {
        content.push(star)
    }
    if (text) {
        content.push(text)
    }
    var canvas = drawList({
        key,
        content: content,
        textSize: 50,
        spacing: 0
    })
    return canvas
}
