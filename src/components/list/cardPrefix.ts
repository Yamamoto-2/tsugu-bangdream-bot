import { Card } from '../../types/Card'
import { Image, loadImage, Canvas, createCanvas } from 'canvas'
import { assetsRootPath } from '../../config'
import { Band } from '../../types/Band'
import { Character } from '../../types/Character'
import { getServerByPriority } from '../../types/Server'
import { setFontStyle } from '../text'
import * as path from 'path'

var prefixBG: Image
async function loadImageOnce() {
    prefixBG = await loadImage(path.join(assetsRootPath, 'cardPrefix.png'))
}
loadImageOnce()

async function drawCardPrefixInList(card: Card) {
    const canvas = createCanvas(1000, 155)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(prefixBG, 0, 0)

    //bandLogo
    const band = new Band(card.bandId)
    const bandLogo = await band.getLogo()
    ctx.drawImage(bandLogo, 130, 25, 240, bandLogo.height * 240 / bandLogo.width)

    //prefix
    const server = getServerByPriority(card.releasedAt)
    ctx.fillStyle = '#5b5b5b'
    ctx.textBaseline = 'hanging'
    ctx.textAlign = 'left'
    setFontStyle(ctx, 30, 'old')
    ctx.fillText(server.getContentByServer(card.prefix), 400, 35, 470)

    //characterName
    const character = new Character(card.characterId)
    const tempserver = getServerByPriority(character.characterName)
    const characterName = tempserver.getContentByServer(character.characterName)
    setFontStyle(ctx, 40, 'old')
    ctx.fillText(characterName, 400, 75, 470)

    return canvas
}

export{drawCardPrefixInList}