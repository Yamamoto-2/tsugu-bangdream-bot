import { Event } from "@/types/Event"
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { drawBannerImageCanvas } from '@/components/dataBlock/utils'
import { Gacha } from '@/types/Gacha'
import { Server, getServerByPriority } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { drawGashaPaymentMethodInList } from '@/components/list/gachaPaymentMethod';
import { drawGachaRateInList } from '@/components/list/gachaRate';
import { drawGachaPickupInList } from '@/components/list/gachaPickUp'
import { drawArticleTitle1 } from '@/components/article/title'
import { getEventGachaAndCardList } from '@/view/eventDetail'

export async function drawEventPreviewGacha(eventId: number): Promise<Array<Buffer | string>> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    const result = []

    const title = await drawArticleTitle1('活动卡池', 'Gacha', event, true)
    result.push(await title.toBuffer('png'))

    //卡池列表
    const eventGachaAndCardList = await getEventGachaAndCardList(event, Server.jp)
    let gachaList = eventGachaAndCardList.gachaList

    const promises = []
    for (let i = 0; i < gachaList.length; i++) {
        const gacha = gachaList[i]
        if (gacha.type == 'birthday') {
            continue
        }
        promises.push(await drawEventGachaDetail(gacha, [Server.jp, Server.tw, Server.cn]))
    }
    const gachaImages = await Promise.all(promises)

    result.push(...gachaImages)
    return result
}

async function drawEventGachaDetail(gacha: Gacha, displayedServerList: Server[]): Promise<string | Buffer> {
    if (!gacha.isExist) {
        return '错误: 卡池不存在'
    }
    await gacha.initFull()
    var list: Array<Image | Canvas> = []
    //bannner
    var gachaBannerImage = await gacha.getBannerImage()
    var gachaBannerImageCanvas = drawBannerImageCanvas(gachaBannerImage)
    list.push(gachaBannerImageCanvas)
    list.push(new Canvas(800, 30))

    //标题
    list.push(await drawListByServerList(gacha.gachaName, '卡池名称', displayedServerList))
    list.push(line)

    //类型
    var typeImage = drawList({
        key: '类型', text: gacha.getTypeName()
    })

    //卡池ID
    var IdImage = drawList({
        key: 'ID', text: gacha.gachaId.toString()
    })

    list.push(drawListMerge([typeImage, IdImage]))
    list.push(line)

    //描述
    list.push(await drawListByServerList(gacha.description, '描述', displayedServerList))
    list.push(line)

    var server = getServerByPriority(gacha.publishedAt, displayedServerList)

    //支付方法
    list.push(await drawGashaPaymentMethodInList(gacha))
    list.push(line)

    //概率分布
    list.push(await drawGachaRateInList(gacha, server))
    list.push(line)

    //卡池pickUp
    try {
        list.push(await drawGachaPickupInList(gacha, server))
    }
    catch (e) {
        console.log(e)
    }

    var listImage = drawDatablock({ list })
    var all = []
    all.push(listImage)

    const gachaBGImage = await gacha.getGachaBGImage();
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: false,
        BGimage: gachaBGImage,
        text: 'Gacha'
    })
    return buffer
}