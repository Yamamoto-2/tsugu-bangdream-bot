import { Event } from '@/types/Event';
import { Card } from '@/types/Card'
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { drawGachaDatablock } from '@/components/dataBlock/gacha'
import { Image, Canvas } from 'skia-canvas'
import { drawBannerImageCanvas } from '@/components/dataBlock/utils'
import { drawTimeInList } from '@/components/list/time';
import { drawAttributeInList } from '@/components/list/attribute'
import { drawCharacterInList } from '@/components/list/character'
import { statConfig } from '@/components/list/stat'
import { drawCardListInList } from '@/components/list/cardIconList'
import { getPresentGachaList, Gacha } from '@/types/Gacha'
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { drawDegreeListOfEvent } from '@/components/list/degreeList';
import { Song, getPresentSongList } from '@/types/Song'
import { drawSongListDataBlock } from '@/components/dataBlock/songList';
import { globalDefaultServer, serverNameFullList } from '@/config';
import { drawSongInList, drawSongListInList } from '@/components/list/song';
import { resizeImage } from '@/components/utils';

export async function drawEventDetail(eventId: number, displayedServerList: Server[] = globalDefaultServer, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    var list: Array<Image | Canvas> = []

    //bannner
    var eventBannerImage = await event.getBannerImage()
    var eventBannerImageCanvas = drawBannerImageCanvas(eventBannerImage)
    list.push(eventBannerImageCanvas)
    list.push(new Canvas(800, 30))

    //标题
    list.push(await drawListByServerList(event.eventName, '活动名称', displayedServerList))
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
    list.push(await drawDegreeListOfEvent(event, displayedServerList))
    list.push(line)

    //有歌榜活动的歌榜歌曲
    const eventTypes: string[] = ['versus', 'challenge', 'medley']
    if (eventTypes.includes(event.eventType) && event.musics != undefined && event.musics.length > 0) {
        let songs: Song[] = []
        let defaultServer = displayedServerList[0]
        if (!event.musics[displayedServerList[0]]) {
            defaultServer = Server.jp
        }
        for (let i = 0; i < event.musics[defaultServer].length; i++) {
            songs.push(new Song(event.musics[defaultServer][i].musicId))
        }
        list.push(await drawSongListInList(songs))
        list.push(line)
    }

    //活动表情
    const stampImage = await event.getRewardStamp(displayedServerList[0])
    if(stampImage){
        list.push(
            await drawList({
                key: '活动表情',
                content: [stampImage],
                textSize: 160,
                lineHeight: 160
            })
        )
        list.push(line)
    }

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

    var gachaCardList: Card[] = []
    var gachaCardIdList: number[] = []//用于去重
    var gachaImageList: Canvas[] = []
    var gachaIdList: number[] = []//用于去重
    //活动期间卡池卡牌
    for (var i = 0; i < displayedServerList.length; i++) {
        var server = displayedServerList[i]
        if (event.startAt[server] == null) {
            continue
        }
        var EventGachaAndCardList = await getEventGachaAndCardList(event, server)
        var tempGachaList = EventGachaAndCardList.gachaList
        var tempGachaCardList = EventGachaAndCardList.gachaCardList
        for (let i = 0; i < tempGachaList.length; i++) {
            const tempGacha = tempGachaList[i];
            if (gachaIdList.indexOf(tempGacha.gachaId) != -1) {
                continue
            }
            if (i == 0) {
                gachaImageList.push(await drawGachaDatablock(tempGacha, `${serverNameFullList[server]}相关卡池`))
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

    var listImage = drawDatablock({ list })
    //创建最终输出数组

    var all = []
    all.push(drawTitle('查询', '活动'))

    all.push(listImage)

    //歌曲
    for (let i = 0; i < displayedServerList.length; i++) {
        const server = displayedServerList[i];
        if (event.startAt[server] == null) {
            continue
        }
        const songList: Song[] = getPresentSongList(server, event.startAt[server], event.endAt[server] + 1000 * 60 * 60);

        if (songList.length !== 0) {
            const isDuplicate = all.some((block) => {
                // 检查当前的songList是否与已存在的块的songList完全相同
                return JSON.stringify(block.songList) === JSON.stringify(songList);
            });

            if (!isDuplicate) {
                all.push(await drawSongListDataBlock(songList, `${serverNameFullList[server]}相关歌曲`));
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
        useEasyBG: useEasyBG,
        BGimage,
        text: 'Event',
        compress: compress,
    })

    return [buffer];
}

export async function getEventGachaAndCardList(event: Event, mainServer: Server, useCache = false) {
    var gachaList: Gacha[] = []
    var gachaIdList = []//用于去重
    if (event.startAt[mainServer] == null) {
        return { gachaCardList: [], gachaList: [] }
    }
    let tempGachaList = await getPresentGachaList(mainServer, event.startAt[mainServer], event.endAt[mainServer])
    for (var j = 0; j < tempGachaList.length; j++) {
        if (gachaIdList.indexOf(tempGachaList[j].gachaId) == -1) {
            gachaList.push(tempGachaList[j])
            gachaIdList.push(tempGachaList[j].gachaId)
        }
    }
    var gachaCardIdList: number[] = []
    for (var i = 0; i < gachaList.length; i++) {
        var tempGacha = gachaList[i]
        if (tempGacha.type == 'birthday') {
            continue
        }
        await tempGacha.initFull(!useCache)
        var tempCardList = tempGacha.pickUpCardId
        /*
        //检查是否有超过7张稀有度2的卡牌，发布了太多2星卡的卡池会被跳过
        var rarity2CardNum = 0
        for (var j = 0; j < tempCardList.length; j++) {
            let tempCard = new Card(tempCardList[j])
            if (tempCard.rarity == 2) {
                rarity2CardNum++
            }
        }
        if (rarity2CardNum > 6) {
            continue
        }
        */
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
        if (tempCard.releasedAt[mainServer] < event.startAt[mainServer] - 1000 * 60 * 60 * 24 || tempCard.releasedAt[mainServer] > event.endAt[mainServer]) {
            continue
        }
        gachaCardList.push(tempCard)
    }

    gachaCardList.sort((a, b) => {
        return a.rarity - b.rarity
    })
    gachaList.sort((a, b) => {
        if (a.publishedAt[mainServer] != b.publishedAt[mainServer]) {
            return a.publishedAt[mainServer] - b.publishedAt[mainServer]
        }
        else {
            return a.gachaId - b.gachaId
        }
    })
    return { gachaCardList, gachaList }
}