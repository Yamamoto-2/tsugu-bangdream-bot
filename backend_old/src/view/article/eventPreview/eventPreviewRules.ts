import { Event } from '@/types/Event';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { Server } from '@/types/Server';
import { outputFinalBuffer } from '@/image/output'
import { drawArticleTitle1 } from '@/components/article/title'
import { resizeImage } from '@/components/utils';
import { createRoundedRectangleCanvas } from "@/image/createRoundedRectangleCanvas";
import { drawImageWithShadow } from "@/image/drawImageWithShadow"

export async function drawEventPreviewRules(eventId: number): Promise<Array<Buffer | string>> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()

    const result = []


    const title = await drawArticleTitle1('活动规则', 'Rules', event, true)
    result.push(await title.toBuffer('png'))

    let list: Array<Image | Canvas> = []

    //规则
    const rules = await event.getEventSlideImage(Server.tw)
    for (let i = 0; i < rules.length; i++) {
        const element = rules[i]
        const elementResized = resizeImage({ image: element, widthMax: 770 })
        const elementRounded = await createRoundedRectangleCanvas(elementResized, 25)
        const tempCanvas = new Canvas(800, elementRounded.height + 50)
        const tempCtx = tempCanvas.getContext('2d')
        drawImageWithShadow(tempCtx, elementRounded, 15, 25)
        list.push(tempCanvas)
    }

    var listImage = drawDatablock({ list, opacity: 0.75 })

    //创建最终输出数组
    let all: Array<Image | Canvas> = []

    all.push(listImage)

    var BGimage = await event.getEventBGImage()

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: false,
        BGimage,
        text: 'Rules'
    })

    result.push(buffer)

    return result;
}