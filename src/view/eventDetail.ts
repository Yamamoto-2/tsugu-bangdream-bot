import { h, Element } from 'koishi'
import { Event } from '../types/Event';
import { Card } from '../types/Card'
import { drawList, line, drawListByServerList, drawTips, drawListMerge } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { drawGachaDatablock } from '../components/dataBlock/gacha'
import { Image, Canvas, createCanvas } from 'canvas'
import { drawBannerImageCanvas } from '../components/dataBlock/utils'
import { drawTimeInList } from '../components/list/time';
import { drawAttributeInList } from '../components/list/attribute'
import { drawCharacterInList } from '../components/list/character'
import { statConfig } from '../components/list/cardStat'
import { drawCardListInList } from '../components/list/cardIconList'
import { getPresentGachaList, Gacha } from '../types/Gacha'
import { Server, defaultserverList } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { drawDegreeListOfEvent } from '../components/list/degreeList';
import { Song, getPresentSongList } from '../types/Song'
import { drawSongListDataBlock } from '../components/dataBlock/songList';

export async function drawEventDetail(eventId: number): Promise<Element | string> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return '错误: 卡牌不存在'
    }
    await event.initFull()
    var list: Array<Image | Canvas> = []

    //bannner
    var eventBannerImage = await event.getBannerImage()
    var eventBannerImageCanvas = drawBannerImageCanvas(eventBannerImage)
    list.push(eventBannerImageCanvas)
    list.push(createCanvas(800, 30))

    //标题
    list.push(await drawListByServerList({
        key: '活动名称',
        content: event.eventName
    }))
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
        content: event.startAt
    }))
    list.push(line)

    //结束时间
    list.push(await drawTimeInList({
        key: '结束时间',
        content: event.endAt
    }))
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
    list.push(await drawDegreeListOfEvent(event))
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


    //创建最终输出数组
    var listImage = await drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '活动'))
    all.push(listImage)

    var gachaCardList:Card[]= []
    var gachaCardIdList:number[] = []//用于去重
    var gachaImageList:Canvas[] = []
    var gachaIdList:number[] = []//用于去重
    //活动期间卡池卡牌
    for (var i = 0; i < defaultserverList.length; i++) {
        var server = defaultserverList[i]
        var EventGachaAndCardList = await getEventGachaAndCardList(event, server)
        var tempGachaList = EventGachaAndCardList.gachaList
        var tempGachaCardList = EventGachaAndCardList.gachaCardList
        for (let i = 0; i < tempGachaList.length; i++) {
            const tempGacha = tempGachaList[i];
            if (gachaIdList.indexOf(tempGacha.gachaId) != -1) {
                continue
            }
            if (i == 0) {
                gachaImageList.push(await drawGachaDatablock(tempGacha, `${server.serverNameFull}相关卡池`))
            }
            else {
                gachaImageList.push(await drawGachaDatablock(tempGacha))
            }
            gachaIdList.push(tempGacha.gachaId)
        }
        for (let i = 0; i < tempGachaCardList.length; i++) {
            const tempCard = tempGachaCardList[i];
            if (gachaCardIdList.indexOf(tempCard.cardId) != -1) {
                continue
            }
            gachaCardIdList.push(tempCard.cardId)
            gachaCardList.push(tempCard)
        }
    }



    list.push(await drawCardListInList({
        key: '活动期间卡池卡牌',
        cardList: gachaCardList,
        cardIdVisible: true,
        skillTypeVisible: true,
        cardTypeVisible: true,
        trainingStatus: false
    }))



    //歌曲
    for (let i = 0; i < defaultserverList.length; i++) {
        const server = defaultserverList[i];
        const songList: Song[] = getPresentSongList(server, event.startAt[server.serverId], event.endAt[server.serverId]);

        if (songList.length !== 0) {
            const isDuplicate = all.some((block) => {
                // 检查当前的songList是否与已存在的块的songList完全相同
                return JSON.stringify(block.songList) === JSON.stringify(songList);
            });

            if (!isDuplicate) {
                all.push(await drawSongListDataBlock(songList, `${server.serverNameFull}相关歌曲`));
            }
        }
    }

    //卡池
    for (let i = 0; i < gachaImageList.length; i++) {
        all.push(gachaImageList[i])
    }

    var BGimage = await event.getEventBGImage()

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: false,
        BGimage,
        text: 'Event'
    })

    return h.image(buffer, 'image/png')

}

export async function getEventGachaAndCardList(event: Event, server: Server) {
    var gachaList: Gacha[] = []
    var gachaIdList = []//用于去重
    if (server.getContentByServer(event.startAt) == null) {
        return { gachaCardList: [], gachaList: [] }
    }
    let tempGachaList = getPresentGachaList(server, event.startAt[server.serverId], event.endAt[server.serverId])
    for (var j = 0; j < tempGachaList.length; j++) {
        if (gachaIdList.indexOf(tempGachaList[j].gachaId) == -1) {
            gachaList.push(tempGachaList[j])
            gachaIdList.push(tempGachaList[j].gachaId)
        }
    }
    var gachaCardIdList: number[] = []
    for (var i = 0; i < gachaList.length; i++) {
        var tempGacha = gachaList[i]
        var tempCardList = tempGacha.newCards
        var rarity2CardNum = 0
        //检查是否有超过5张稀有度2的卡牌，发布了太多2星卡的卡池会被跳过
        for (var j = 0; j < tempCardList.length; j++) {
            let tempCard = new Card(tempCardList[j])
            if (tempCard.rarity == 2) {
                rarity2CardNum++
            }
        }
        if (rarity2CardNum > 4) {
            continue
        }
        for (var j = 0; j < tempCardList.length; j++) {
            var tempCardId = tempCardList[j]
            if (gachaCardIdList.indexOf(tempCardId) == -1) {
                gachaCardIdList.push(tempCardId)
            }
        }
    }
    var gachaCardList: Card[] = []
    for (var i = 0; i < gachaCardIdList.length; i++) {
        var tempCardId = gachaCardIdList[i]
        var tempCard = new Card(tempCardId)
        //如果卡牌的发布时间不在活动期间内，则不显示
        if (server.getContentByServer(tempCard.releasedAt) < server.getContentByServer(event.startAt) || server.getContentByServer(tempCard.releasedAt) > server.getContentByServer(event.endAt)) {
            continue
        }
        gachaCardList.push(tempCard)
    }

    gachaCardList.sort((a, b) => {
        return a.rarity - b.rarity
    })
    return { gachaCardList, gachaList }
}