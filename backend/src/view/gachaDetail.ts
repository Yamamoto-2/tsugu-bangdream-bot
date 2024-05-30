import { getPresentEvent } from '@/types/Event';
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { drawBannerImageCanvas } from '@/components/dataBlock/utils'
import { drawTimeInList } from '@/components/list/time';
import { Gacha } from '@/types/Gacha'
import { Server, getServerByPriority } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { drawEventDatablock } from '@/components/dataBlock/event';
import { drawGashaPaymentMethodInList } from '@/components/list/gachaPaymentMethod';
import { drawGachaRateInList } from '@/components/list/gachaRate';
import { globalDefaultServer, serverNameFullList } from '@/config';
import { drawGachaPickupInList } from '@/components/list/gachaPickUp'

export async function drawGachaDetail(gachaId: number, displayedServerList: Server[] = globalDefaultServer, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {
    const gacha = new Gacha(gachaId)
    if (!gacha.isExist) {
        return ['错误: 卡池不存在']
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

    //开始时间
    list.push(await drawTimeInList({
        key: '开始时间',
        content: gacha.publishedAt
    }))
    list.push(line)

    //结束时间
    list.push(await drawTimeInList({
        key: '结束时间',
        content: gacha.closedAt
    }))
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
    all.push(drawTitle('查询', '卡池'))
    all.push(listImage)

    //相关活动
    var tempEventIdList = []//用于防止重复
    var eventImageList: Array<Canvas | Image> = []

    for (let k = 0; k < displayedServerList.length; k++) {
        let server = displayedServerList[k]
        if (gacha.publishedAt[server] == null) {
            continue
        }
        var relatedEvent = getPresentEvent(server, gacha.publishedAt[server])
        if (relatedEvent != null && !tempEventIdList.includes(relatedEvent.eventId)) {
            tempEventIdList.push(relatedEvent.eventId)
            eventImageList.push(await drawEventDatablock(relatedEvent, displayedServerList, `${serverNameFullList[server]}相关活动`))
        }
    }

    for (let i = 0; i < eventImageList.length; i++) {
        all.push(eventImageList[i])
    }
    const gachaBGImage = await gacha.getGachaBGImage();
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: useEasyBG,
        BGimage: gachaBGImage,
        text: 'Gacha',
        compress: compress,
    })
    return [buffer]
}
