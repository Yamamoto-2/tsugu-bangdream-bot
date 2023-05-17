import { assetsRootPath } from '../config'
import { setFontStyle } from '../components/text'
import { Band } from '../types/Band'
import { Attribute } from '../types/Attribute'
import { Card } from '../types/Card'
import { Image, Canvas, loadImage, createCanvas } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'
import { drawCardIconSkill } from './skill'
import * as path from 'path'
import { Skill } from '../types/Skill'



//根据稀有度与属性，获得图标框
async function getCardIconFrame(rarity: number, attribute: 'cool' | 'happy' | 'pure' | 'powerful'): Promise<Image> {
    const baseUrl = 'https://bestdori.com/res/image/card-'
    if (rarity == 1) {
        var imageUrl = baseUrl + '1-' + attribute + '.png'

    }
    else {
        var imageUrl = baseUrl + rarity.toString() + '.png'
    }
    var imageBuffer = await downloadFileCache(imageUrl)
    return (await loadImage(imageBuffer))
}


var cardTypeIconList: { [type: string]: Image } = {}
var starList: { [type: string]: Image } = {}
var limitBreakIcon: Image

async function loadImageOnce() {
    cardTypeIconList.limited = await loadImage(path.join(assetsRootPath, '/Card/L.png'));
    cardTypeIconList.dreamfes = await loadImage(path.join(assetsRootPath, '/Card/D.png'));
    cardTypeIconList.kirafes = await loadImage(path.join(assetsRootPath, '/Card/K.png'));
    starList.normal = await loadImage(path.join(assetsRootPath, '/Card/star.png'));
    starList.trained = await loadImage(path.join(assetsRootPath, '/Card/star_trained.png'));
    limitBreakIcon = await loadImage(path.join(assetsRootPath, '/Card/limitBreakRank.png'));
}

loadImageOnce()

interface drawCardIconOptions {
    card: Card
    trainningStatus: boolean,
    limitBreakRank?: number,
    level?: number,
    cardIdVisible?: boolean,
    skillTypeVisible?: boolean,
    cardTypeVisible?: boolean,
    skillLevel?: number,

}

async function drawCardIcon({
    card,
    trainningStatus,
    limitBreakRank = 0,
    cardIdVisible = false,
    skillTypeVisible = false,
    cardTypeVisible = true,
    skillLevel
}: drawCardIconOptions): Promise<Canvas> {
    trainningStatus = card.ableToTraining(trainningStatus)
    const canvas: Canvas = cardIdVisible ? createCanvas(180, 210) : createCanvas(180, 180);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await card.getCardIconImage(trainningStatus), 0, 0);
    //如果显示卡牌ID，画面高度为210，在下方显示
    if (cardIdVisible) {
        ctx.textAlign = 'start'
        ctx.textBaseline = 'middle'
        setFontStyle(ctx, 30, 'old')
        ctx.fillStyle = '#a7a7a7'
        ctx.fillText(`ID:${card.cardId}`, 4, 195)
    }
    //如果显示技能类型，在右上显示
    if (skillLevel != undefined) {
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(138, 91, 35, 39)
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        setFontStyle(ctx, 35, 'old')
        ctx.fillText(skillLevel.toString(), 155.5, 107.5)
    }
    //如果显示技能类型，在右上显示
    else if (cardTypeVisible) {
        if (cardTypeIconList[card.type] != undefined) {
            ctx.drawImage(cardTypeIconList[card.type], 138, 91)
        }
    }
    if (skillTypeVisible) {
        var skill = new Skill(card.skillId)
        var skillTypeIcon = await drawCardIconSkill(skill)
        ctx.drawImage(skillTypeIcon, 180 - skillTypeIcon.width, 142)
    }
    var Frame = await getCardIconFrame(card.rarity, card.attribute)
    ctx.drawImage(Frame, 0, 0);
    var attributeIcon = await new Attribute(card.attribute).getIcon()
    ctx.drawImage(attributeIcon, 132.5, 3, 45.26, 45.26)
    var bandIcon = await new Band(card.bandId).getIcon()
    ctx.drawImage(bandIcon, 0, 0, 45, 45)
    if (limitBreakRank != 0) {
        ctx.drawImage(limitBreakIcon, 137, 51, 39, 39)
        setFontStyle(ctx, 25, 'old')
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(limitBreakRank.toString(), 155, 70)
    }
    var star = starList[trainningStatus ? 'trained' : 'normal']
    for (var i = 0; i < card.rarity; i++) {//星星数量
        ctx.drawImage(star, 4, 150 - 26 * i, 29, 29)
    }
    return canvas
}

export { drawCardIcon }