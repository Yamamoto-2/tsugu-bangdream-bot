import { Event } from '@/types/Event'
import { drawArticleTitle1 } from '@/components/article/title'

export async function drawEventPreviewTitle(eventId: number): Promise<Array<Buffer | string>> {

    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    const result = []

    const title = await drawArticleTitle1('活动预览', `ID: ${event.eventId}`, event, true)
    result.push(title.toBuffer('image/png'))
    return result
}