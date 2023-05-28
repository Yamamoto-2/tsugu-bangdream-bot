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

    //活动期间卡池卡牌

    var EventGachaAndCardList = await getEventGachaAndCardList(event)
    var gachaList = EventGachaAndCardList.gachaList
    var gachaCardList = EventGachaAndCardList.gachaCardList

    list.push(await drawCardListInList({
        key: '活动期间卡池卡牌',
        cardList: gachaCardList,
        cardIdVisible: true,
        skillTypeVisible: true,
        cardTypeVisible: true,
        trainingStatus: false
    }))

    //创建最终输出数组
    var listImage = await drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '活动'))
    all.push(listImage)

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
    for (let i = 0; i < gachaList.length; i++) {
        const tempGacha = gachaList[i];
        if (i == 0) {
            all.push(await drawGachaDatablock(tempGacha, '相关卡池'))
        }
        else {
            all.push(await drawGachaDatablock(tempGacha))

        }
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

export async function getEventGachaAndCardList(event: Event) {
    var gachaList: Gacha[] = []
    var gachaIdList = []//用于去重
    for (var i = 0; i < defaultserverList.length; i++) {
        let server = defaultserverList[i]
        if (server.getContentByServer(event.startAt) == null) {
            continue
        }
        let tempGachaList = getPresentGachaList(server, event.startAt[server.serverId], event.endAt[server.serverId])
        for (var j = 0; j < tempGachaList.length; j++) {
            if (gachaIdList.indexOf(tempGachaList[j].gachaId) == -1) {
                gachaList.push(tempGachaList[j])
                gachaIdList.push(tempGachaList[j].gachaId)
            }
        }
    }

    var gachaCardIdList: number[] = []
    for (var i = 0; i < gachaList.length; i++) {
        var tempGacha = gachaList[i]
        var tempCardList = tempGacha.newCards
        for (var j = 0; j < tempCardList.length; j++) {
            var tempCard = tempCardList[j]
            if (gachaCardIdList.indexOf(tempCard) == -1) {
                gachaCardIdList.push(tempCard)
            }
        }
    }
    var gachaCardList: Card[] = []
    for (var i = 0; i < gachaCardIdList.length; i++) {
        var tempCardId = gachaCardIdList[i]
        gachaCardList.push(new Card(tempCardId))
    }
    gachaCardList.sort((a, b) => {
        return a.rarity - b.rarity
    })
    return { gachaCardList, gachaList }
}