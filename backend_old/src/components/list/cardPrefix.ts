import { Card } from '@/types/Card'
import { Canvas } from 'skia-canvas'
import { globalDefaultServer } from '@/config'
import { Band } from '@/types/Band'
import { Character } from '@/types/Character'
import { Server, getServerByPriority } from '@/types/Server'
import { setFontStyle } from '@/image/text'
import { drawRoundedRect } from '@/image/drawRect'

var prefixBG: Canvas
async function loadImageOnce() {
    prefixBG = drawRoundedRect({
        width: 800,
        height: 155,
        color: '#f1f1ef',
        radius: [15, 15, 0, 0]
    })
}
loadImageOnce()

export async function drawCardPrefixInList(card: Card, displayedServerList: Server[] = globalDefaultServer) {
    const canvas = new Canvas(800, 155)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(prefixBG, 0, 0)

    //bandLogo
    const band = new Band(card.bandId)
    const bandLogo = await band.getLogo()
    ctx.drawImage(bandLogo, 30, 25, 240, bandLogo.height * 240 / bandLogo.width)

    //prefix
    const server = getServerByPriority(card.releasedAt, displayedServerList)
    ctx.fillStyle = '#5b5b5b'
    ctx.textBaseline = 'hanging'
    ctx.textAlign = 'left'
    setFontStyle(ctx, 30, 'old')
    ctx.fillText(card.prefix[server], 300, 35, 470)

    //characterName
    const character = new Character(card.characterId)
    const tempserver = getServerByPriority(character.characterName, displayedServerList)
    const characterName = character.characterName[tempserver]
    setFontStyle(ctx, 40, 'old')
    ctx.fillText(characterName, 300, 75, 470)

    return canvas
}
