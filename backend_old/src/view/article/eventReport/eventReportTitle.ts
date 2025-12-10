import { Canvas } from 'skia-canvas'
import { Event } from '@/types/Event'
import { getEventGachaAndCardList } from '@/view/eventDetail'
import { Server } from '@/types/Server'
import { assetsRootPath } from '@/config'
import { resizeImage } from '@/components/utils'
import { loadImageFromPath } from '@/image/utils';

export async function drawEventReportTitle(eventId: number): Promise<Array<Buffer | string>> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    const eventReportTitleFrame = resizeImage({
        image: await loadImageFromPath(assetsRootPath + '/eventReportTitleFrame.png'),
        widthMax: 1000,
    })
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
    const canvas = new Canvas(eventReportTitleFrame.width, eventReportTitleFrame.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(resizedCardIllustrationImage, 0, 0)
    ctx.drawImage(eventReportTitleFrame, 0, 0)
    return [await canvas.toBuffer('png')]
}