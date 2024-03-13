import { Canvas, createCanvas, loadImage } from 'canvas'

import { Event } from '@/types/Event'
import { drawArticleTitle1 } from '@/components/article/title'
import { getEventGachaAndCardList } from '@/view/eventDetail'
import { resizeImage } from '@/components/utils'
import { Server } from '@/types/Server'

export async function drawEventPreviewTitle(eventId: number): Promise<Array<Buffer | string>> {

    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    const result = []

    const height = 560
    const width = 1000
    const titleImage = await drawArticleTitle1('活动预览', `ID: ${event.eventId}`, event, false)

    const eventGachaAndCardList = await getEventGachaAndCardList(event, Server.jp)

    const gachaCardList = eventGachaAndCardList.gachaCardList
    gachaCardList.sort((a, b) => {
        return b.rarity - a.rarity
    })
    const card = gachaCardList[0]
    const cardIllustrationImage = await card.getCardIllustrationImage(false)
    const resizedCardIllustrationImage = resizeImage({
        image: cardIllustrationImage,
        widthMax: 1000,
    })
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(resizedCardIllustrationImage, 0, 0)
    ctx.drawImage(titleImage, 0, height / 2 - titleImage.height / 2)

    result.push(canvas.toBuffer('image/png'))

    return result
}