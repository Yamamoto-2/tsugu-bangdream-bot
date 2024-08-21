import { Event } from '@/types/Event';
import { Card } from '@/types/Card'
import { drawArticleTrimBanner } from '@/components/article/trimBanner'
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { drawTimeInList } from '@/components/list/time';
import { drawAttributeInList } from '@/components/list/attribute'
import { drawCharacterInList } from '@/components/list/character'
import { statConfig } from '@/components/list/stat'
import { drawCardListInList } from '@/components/list/cardIconList'
import { Server } from '@/types/Server';
import { outputFinalBuffer } from '@/image/output'
import { drawDegreeListOfEvent } from '@/components/list/degreeList';
import { getEventGachaAndCardList } from '@/view/eventDetail'

export async function drawEventPreviewDetail(eventId: number): Promise<Array<Buffer | string>> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    let all: Array<Image | Canvas> = []

    //标题
    all.push(await drawArticleTrimBanner(event))

    //活动信息表----------
    let list: Array<Image | Canvas> = []
    //标题
    list.push(await drawListByServerList(event.eventName, '活动名称', [Server.jp, Server.tw, Server.cn]))
    list.push(line)

    //类型
    var typeImage = drawList({
        key: '类型', text: event.getTypeName()
    })

    //活动ID
    var IdImage = drawList({
        key: 'ID', text: event.eventId.toString()
    })

    list.push(drawListMerge([typeImage, IdImage]))
    list.push(line)

    //开始时间
    list.push(await drawTimeInList({
        key: '开始时间',
        content: event.startAt,
        eventId: event.eventId,
        estimateCNTime: true
    }, [Server.jp, Server.tw, Server.cn]))
    list.push(line)

    //结束时间
    list.push(await drawTimeInList({
        key: '结束时间',
        content: event.endAt
    }, [Server.jp, Server.tw, Server.cn]))
    list.push(line)


    //活动属性加成
    list.push(drawList({
        key: '活动加成'
    }))
    var attributeList = event.getAttributeList()
    for (const i in attributeList) {
        if (Object.prototype.hasOwnProperty.call(attributeList, i)) {
            const element = attributeList[i];
            list.push(await drawAttributeInList({
                content: element,
                text: ` +${i}%`
            }))
        }
    }
    list.push(line)

    //活动角色加成
    list.push(drawList({
        key: '活动角色加成'
    }))
    var characterList = event.getCharacterList()
    for (const i in characterList) {
        if (Object.prototype.hasOwnProperty.call(characterList, i)) {
            const element = characterList[i];
            list.push(await drawCharacterInList({
                content: element,
                text: ` +${i}%`
            }))
        }
    }
    list.push(line)

    //活动偏科加成(stat)
    if (Object.keys(event.eventCharacterParameterBonus).length != 0) {
        var statText = ''
        for (const i in event.eventCharacterParameterBonus) {
            if (i == 'eventId') {
                continue
            }
            if (Object.prototype.hasOwnProperty.call(event.eventCharacterParameterBonus, i)) {
                const element = event.eventCharacterParameterBonus[i];
                if (element == 0) {
                    continue
                }
                statText += `${statConfig[i].name} + ${element}%  `
            }
        }
        list.push(drawList({
            key: '活动偏科加成',
            text: statText
        }))
        list.push(line)
    }

    //牌子
    list.push(await drawDegreeListOfEvent(event, [Server.tw]))
    list.push(line)

    //奖励卡牌
    var rewardCardList: Card[] = []
    for (let i = 0; i < event.rewardCards.length; i++) {
        const cardId = event.rewardCards[i];
        rewardCardList.push(new Card(cardId))
    }
    list.push(await drawCardListInList({
        key: '奖励卡牌',
        cardList: rewardCardList,
        cardIdVisible: true,
        skillTypeVisible: true,
        cardTypeVisible: true,
        trainingStatus: false
    }))
    list.push(line)

    //活动期间卡池卡牌
    const eventGachaAndCardList = await getEventGachaAndCardList(event, Server.jp)
    list.push(await drawCardListInList({
        key: '活动期间卡池卡牌',
        cardList: eventGachaAndCardList.gachaCardList,
        cardIdVisible: true,
        skillTypeVisible: true,
        cardTypeVisible: true,
        trainingStatus: false
    }))

    //活动信息表----------
    var listImage = drawDatablock({ list, opacity: 0.75 })

    //创建最终输出数组
    all.push(listImage)

    var BGimage = await event.getEventBGImage()

    var buffer = await outputFinalBuffer({
        startWithSpace: false,
        imageList: all,
        useEasyBG: false,
        BGimage,
        text: 'Event Preview'
    })

    return [buffer];
}