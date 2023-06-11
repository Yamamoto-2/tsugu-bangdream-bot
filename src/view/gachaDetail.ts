import { h, Element } from 'koishi'
import { getPresentEvent } from '../types/Event';
import { Card } from '../types/Card'
import { drawList, line, drawListByServerList, drawListMerge } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { Image, Canvas, createCanvas } from 'canvas'
import { drawBannerImageCanvas } from '../components/dataBlock/utils'
import { drawTimeInList } from '../components/list/time';
import { drawCardListInList } from '../components/list/cardIconList'
import { Gacha } from '../types/Gacha'
import { Server, getServerByPriority } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { drawEventDatablock } from '../components/dataBlock/event';
import { drawGashaPaymentMethodInList } from '../components/list/gachaPaymentMethod';
import { drawGachaRateInList } from '../components/list/gachaRate';
import { globalDefaultServer, serverNameFullList } from '../config';

export async function drawGachaDetail(gachaId: number, defaultServerList: Server[] = globalDefaultServer): Promise<Element | string> {
    const gacha = new Gacha(gachaId)
    if (!gacha.isExist) {
        return '错误: 卡池不存在'
    }
    await gacha.initFull()
    var list: Array<Image | Canvas> = []
    //bannner
    var gachaBannerImage = await gacha.getBannerImage()
    var gachaBannerImageCanvas = drawBannerImageCanvas(gachaBannerImage)
    list.push(gachaBannerImageCanvas)
    list.push(createCanvas(800, 30))

    //标题
    list.push(await drawListByServerList(gacha.gachaName, '卡池名称', defaultServerList))
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
    list.push(await drawListByServerList(gacha.description, '描述', defaultServerList))
    list.push(line)



    var server = getServerByPriority(gacha.publishedAt, defaultServerList)

    //支付方法
    list.push(await drawGashaPaymentMethodInList(gacha))
    list.push(line)

    //概率分布
    list.push(await drawGachaRateInList(gacha, server))

    //卡池pickUp
    var pickUpCardIdList = []
    var details = gacha.details[server]
    for (var cardId in details) {
        if (details[cardId].pickUp == true) {
            pickUpCardIdList.push(parseInt(cardId))
        }
    }
    //卡池pickUp 去除重复
    pickUpCardIdList = Array.from(new Set(pickUpCardIdList))
    var pickUpCardList = []
    for (var i = 0; i < pickUpCardIdList.length; i++) {
        var card = new Card(pickUpCardIdList[i])
        pickUpCardList.push(card)
    }
    //如果pickUp卡牌数量不为0
    if (pickUpCardList.length != 0) {
        list.push(line)
        list.push(await drawCardListInList({
            key: 'PickUp',
            cardList: pickUpCardList,
            trainingStatus: false,
            cardIdVisible: true,
            cardTypeVisible: true,
            skillTypeVisible: true,
        }))
    }




    var listImage = drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '卡池'))
    all.push(listImage)

    //相关活动
    var tempEventIdList = []//用于防止重复
    var eventImageList: Array<Canvas | Image> = []

    for (let k = 0; k < defaultServerList.length; k++) {
        let server = defaultServerList[k]
        if (gacha.publishedAt[server] == null) {
            continue
        }
        var relatedEvent = getPresentEvent(server, gacha.publishedAt[server])
        if (relatedEvent != null && !tempEventIdList.includes(relatedEvent.eventId)) {
            tempEventIdList.push(relatedEvent.eventId)
            eventImageList.push(await drawEventDatablock(relatedEvent, `${serverNameFullList[server]}相关活动`))
        }
    }

    for (let i = 0; i < eventImageList.length; i++) {
        all.push(eventImageList[i])
    }
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })
    return h.image(buffer, 'image/png')
}
