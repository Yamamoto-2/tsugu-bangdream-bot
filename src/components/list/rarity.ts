import { Canvas, Image, loadImage } from 'canvas'
import { drawList } from '../list'
import { assetsRootPath } from '../../config'
import * as path from 'path'

interface RarityInListOptions {
    key?: string;
    rarity: number
}

var starList: { [type: string]: Image } = {}
async function loadImageOnce() {
    starList.normal = await loadImage(path.join(assetsRootPath, '/Card/star.png'));
    starList.trained = await loadImage(path.join(assetsRootPath, '/Card/star_trained.png'));
}
loadImageOnce()

export async function drawRarityInList({
    key = "稀有度",
    rarity
}: RarityInListOptions): Promise<Canvas> {
    var list: Array<string | Image | Canvas> = []
    var star: Image
    if (rarity < 3) {
        star = starList.normal
    }
    else {
        star = starList.trained
    }
    for (let i = 0; i < rarity; i++) {
        list.push(star)
    }
    var canvas = drawList({
        key,
        content: list,
        textSize:50,
        spacing:0
    })
    return canvas
}
