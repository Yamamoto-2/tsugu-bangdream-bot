import { globalDefaultServer } from '@/config';
import { Character } from '@/types/Character'
import { Server, getServerByPriority } from '@/types/Server'
import { drawImageListCenter } from '@/components/list'
import { Canvas } from 'skia-canvas'
import { drawRoundedRect } from '@/image/drawRect';
import { resizeImage, stackImage } from '@/components/utils';
import { drawText } from '@/image/text';

const width = 250
const height = 800

export async function drawCharacterHalfBlock(character: Character, displayedServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    const canvas = new Canvas(250, 800)
    const ctx = canvas.getContext('2d')
    await character.initFull(false)
    //底部圆角矩形
    let color: string
    if (character.colorCode) {
        color = character.colorCode.toLowerCase()
    }
    else {
        color = '#ffffff'
    }
    ctx.drawImage(drawRoundedRect({
        width,
        height,
        radius: 20,
        color: color,
        opacity: 0.25
    }), 0, 0)
    //头像
    const characterIllustration = resizeImage({
        image: await character.getIllustration(),
        heightMax: height - 20,
    })

    ctx.drawImage(characterIllustration, width / 2 - characterIllustration.width / 2, 2)
    //画圆角矩形外框
    ctx.drawImage(drawRoundedRect({
        width,
        height,
        radius: 20,
        opacity: 1,
        color: color + '00',
        strokeColor: color,
        strokeWidth: 4
    }), 0, 0)
    //画底部文字用框
    ctx.drawImage(drawRoundedRect({
        width,
        height: 100,
        radius: 20,
        opacity: 1,
        color: color,
    }), 0, height - 100)
    //画底部文字
    //名字
    const list: Canvas[] = []
    const server = getServerByPriority(character.characterName, displayedServerList)
    const nameText = character.characterName[server]
    const nameTextImage = drawText({
        text: nameText,
        textSize: 40,
        color: '#ffffff',
        maxWidth: width,
    })
    list.push(drawImageListCenter([nameTextImage], width))
    //id
    const characterId = character.characterId
    const idText = `ID: ${characterId}`
    const idTextImage = drawText({
        text: idText,
        textSize: 30,
        color: '#ffffff',
        maxWidth: width,
    })
    list.push(drawImageListCenter([idTextImage], width))
    //画底部文字
    const textImage = stackImage(list)
    ctx.drawImage(textImage, 0, height - 100)
    return canvas
}
