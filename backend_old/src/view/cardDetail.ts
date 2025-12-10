import { Card } from '@/types/Card'
import { Skill } from '@/types/Skill';
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { drawCardIllustration } from '@/components/card';
import { drawSkillInList } from '@/components/list/skill'
import { drawTimeInList } from '@/components/list/time';
import { drawCardPrefixInList } from '@/components/list/cardPrefix'
import { drawCardStatInList } from '@/components/list/stat'
import { drawCardListInList } from '@/components/list/cardIconList'
import { drawSdcharaInList } from '@/components/list/cardSdchara'
import { drawEventDatablock } from '@/components/dataBlock/event';
import { drawGachaDatablock } from '@/components/dataBlock/gacha'
import { Image, Canvas } from 'skia-canvas'
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title';
import { outputFinalBuffer } from '@/image/output'
import { Event } from '@/types/Event';
import { Gacha } from '@/types/Gacha';
import { globalDefaultServer, serverNameFullList } from '@/config';


async function drawCardDetail(cardId: number, displayedServerList: Server[] = globalDefaultServer, useEasyBG: boolean, compress: boolean): Promise<Array<string | Buffer>> {
    const card = new Card(cardId)
    if (!card.isExist) {
        return ['错误: 卡牌不存在']
    }
    await card.initFull()
    var source = card.source

    var list: Array<Image | Canvas> = []

    //标题
    list.push(await drawCardPrefixInList(card, displayedServerList))
    var trainingStatusList = card.getTrainingStatusList()
    list.push(new Canvas(800, 30))

    //插画
    for (let i = 0; i < trainingStatusList.length; i++) {
        const element = trainingStatusList[i];
        list.push(await drawCardIllustration({
            card: card,
            trainingStatus: element,
            isList: true
        }))
        list.push(new Canvas(800, 30))
    }

    //类型
    var typeImage = drawList({
        key: '类型', text: card.getTypeName()
    })

    //卡牌ID
    var IdImage = drawList({
        key: 'ID', text: card.cardId.toString()
    })

    list.push(drawListMerge([typeImage, IdImage]))
    list.push(line)


    //综合力
    list.push(await drawCardStatInList(card))
    list.push(line)

    /*
    //乐队
    list.push(await drawBandInList({ key: '乐队', content: [new Band(card.bandId)] }))
    list.push(line)

    //角色
    var character = new Character(card.characterId)
    list.push(await drawCharacterInList({ content: [character] }))
    list.push(line)

    //属性
    var attribute = new Attribute(card.attribute)
    list.push(await drawAttributeInList({ content: [attribute] }))
    list.push(line)

    //稀有度
    list.push(await drawRarityInList({ rarity: card.rarity }))
    list.push(line)
    */
    //技能
    var skill = new Skill(card.skillId)
    list.push(await drawSkillInList({ key: '技能', card: card, content: skill }, displayedServerList))
    list.push(line)

    //标题
    list.push(await drawListByServerList(card.prefix, '标题', displayedServerList))
    list.push(line)

    //判断是否来自卡池
    for (let j = 0; j < displayedServerList.length; j++) {
        var releaseFromGacha = false
        var server = displayedServerList[j];
        if (card.releasedAt[server] == null) {
            continue
        }
        var sourceOfServer = source[server]
        for (const i in sourceOfServer) {
            if (Object.prototype.hasOwnProperty.call(sourceOfServer, i)) {
                if (i == 'gacha' && card.rarity > 2 && card.type != 'kirafes') {
                    //招募语
                    list.push(await drawListByServerList(card.gachaText, '招募语', displayedServerList))
                    list.push(line)
                    releaseFromGacha = true
                    break
                }
            }
        }
        if (releaseFromGacha) {
            break
        }
    }



    //发售日期
    list.push(await drawTimeInList({
        key: '发布日期',
        content: card.releasedAt
    }, displayedServerList))
    list.push(line)

    //缩略图
    list.push(await drawCardListInList({
        key: '缩略图',
        cardList: [card],
        cardIdVisible: false,
        skillTypeVisible: false,
        cardTypeVisible: false,
    }))
    list.push(line)

    //演出缩略图
    list.push(await drawSdcharaInList(card))

    //创建最终输出数组
    var listImage = drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '卡牌'))
    all.push(listImage)
    //相关来源
    var tempEventIdList = []//用于防止重复
    var tempGachaIdList = []
    var eventImageList: Array<Canvas | Image> = []
    var gachaImageList: Array<Canvas | Image> = []
    for (let k = 0; k < displayedServerList.length; k++) {
        let server = displayedServerList[k];
        //如果卡牌有关联活动
        if (card.releaseEvent[server].length != 0) {
            var tempEvent = new Event(card.releaseEvent[server][0])
            if (!tempEventIdList.includes(tempEvent.eventId)) {
                eventImageList.push(await drawEventDatablock(tempEvent, displayedServerList, `${serverNameFullList[server]}相关活动`))
                tempEventIdList.push(tempEvent.eventId)
            }
        }
        //如果卡牌有关联卡池
        if (card.releaseGacha[server].length != 0) {
            const gachaIdList = card.releaseGacha[server]
            gachaIdList.sort((a, b) => {
                const gachaA = new Gacha(a);
                const gachaB = new Gacha(b);
                if (gachaA.publishedAt[server] != gachaB.publishedAt[server]) {
                    return gachaA.publishedAt[server] - gachaB.publishedAt[server];
                }
                else {
                    return gachaA.gachaId - gachaB.gachaId;
                }
            })
            var tempGacha = new Gacha(gachaIdList[0])
            var tempEventId = tempGacha.getEventId()[server]
            if (tempEventId != null) {
                var tempEvent = new Event(tempEventId)
                if (!tempEventIdList.includes(tempEvent.eventId)) {
                    eventImageList.push(await drawEventDatablock(tempEvent, displayedServerList, `${serverNameFullList[server]}相关活动`))
                    tempEventIdList.push(tempEvent.eventId)
                }
            }
            if (!tempGachaIdList.includes(tempGacha.gachaId)) {
                gachaImageList.push(await drawGachaDatablock(tempGacha, `${serverNameFullList[server]}相关卡池`))
                tempGachaIdList.push(tempGacha.gachaId)
            }

        }
    }
    for (var i = 0; i < eventImageList.length; i++) {
        all.push(eventImageList[i])
    }
    for (var i = 0; i < gachaImageList.length; i++) {
        all.push(gachaImageList[i])
    }

    if (card.rarity < 3) {
        var BGimage: Image
    }
    else {
        var BGimage = await card.getCardIllustrationImage(true)
    }

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: useEasyBG,
        BGimage,
        text: 'Card',
        compress: compress,
    })

    return [buffer]
}

export {
    drawCardDetail
}
