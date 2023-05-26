import { Card } from '../types/Card'
import { Character } from '../types/Character';
import { Attribute } from '../types/Attribute';
import { Skill } from '../types/Skill';
import { drawList, drawDatablock, line, drawListByServerList, drawTips, drawListMerge } from '../components/list';
import { drawCardIllustration } from '../components/card';
import { drawCharacterInList } from '../components/list/character'
import { drawAttributeInList } from '../components/list/attribute'
import { drawRarityInList } from '../components/list/rarity'
import { drawSkillInList } from '../components/list/skill'
import { drawTimeInList } from '../components/list/time';
import { drawCardPrefixInList } from '../components/list/cardPrefix'
import { drawCardStatInList } from '../components/list/cardStat'
import { drawCardListInList } from '../components/list/cardIconList'
import { drawSdcharaInList } from '../components/list/cardSdchara'
import { drawEventDatablock } from '../components/dataBlock/event';
import { drawGachaDatablock } from '../components/dataBlock/gacha'
import { Image, Canvas, createCanvas } from 'canvas'
import { Server, defaultserverList } from '../types/Server';
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'
import { Event } from '../types/Event';
import { Gacha, getEarlistGachaFromList } from '../types/Gacha'

async function drawCardDetail(cardId: number): Promise<Buffer> {
    const card = new Card(cardId)
    await card.initFull()
    var source = card.source

    var list: Array<Image | Canvas> = []

    //标题
    list.push(await drawCardPrefixInList(card))
    var trainingStatusList = card.getTrainingStatusList()
    list.push(createCanvas(1000, 30))

    //插画
    for (let i = 0; i < trainingStatusList.length; i++) {
        const element = trainingStatusList[i];
        list.push(await drawCardIllustration({
            card: card,
            trainingStatus: element,
            isList: true
        }))
        list.push(createCanvas(1000, 30))
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
    list.push(await drawSkillInList({ key: '技能', card: card, content: skill }))
    list.push(line)

    //标题
    list.push(await drawListByServerList({
        key: '标题',
        content: card.prefix,
    }))
    list.push(line)

    //判断是否来自卡池
    for (let j = 0; j < defaultserverList.length; j++) {
        var releaseFromGacha = false
        var server = defaultserverList[j];
        var sourceOfServer = source[server.serverId]
        for (const i in sourceOfServer) {
            if (Object.prototype.hasOwnProperty.call(sourceOfServer, i)) {
                if (i == 'gacha' && card.rarity > 2) {
                    //招募语
                    list.push(await drawListByServerList({
                        key: '招募语',
                        content: card.gachaText,
                    }))
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
    }))
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
    var listImage = await drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '卡牌'))
    all.push(listImage)
    //相关来源
    var tempEventList = []//用于防止重复
    var tempGachaList = []
    var eventImageList: Array<Canvas | Image> = []
    var gachaImageList: Array<Canvas | Image> = []
    for (let k = 0; k < defaultserverList.length; k++) {
        var server = defaultserverList[k];
        var sourceOfServer = source[server.serverId]
        for (const i in sourceOfServer) {
            if (Object.prototype.hasOwnProperty.call(sourceOfServer, i)) {
                //如果来源包括活动
                if (i == 'event') {
                    for (const j in sourceOfServer[i]) {
                        if (Object.prototype.hasOwnProperty.call(sourceOfServer[i], j)) {
                            console.log(tempEventList)
                            if (!tempEventList.includes(j)) {//如果不在列表中
                                tempEventList.push(j)
                                eventImageList.push(await drawEventDatablock(new Event(parseInt(j)), `${server.serverNameFull}相关活动`))
                            }
                        }
                    }
                }
                //如果来源包括招募
                if (i == 'gacha') {
                    for (const j in sourceOfServer[i]) {
                        var earlistGacha = getEarlistGachaFromList(sourceOfServer[i], server)
                        var tempEventId = earlistGacha.getEventId()[server.serverId]
                        if (tempEventId != null) {
                            if (!tempEventList.includes(tempEventId.toString)) {//如果不在列表中
                                eventImageList.push(await drawEventDatablock(new Event(tempEventId), `${server.serverNameFull}相关活动`))
                                tempEventList.push(tempEventId.toString)
                            }
                        }
                        if (!tempGachaList.includes(earlistGacha.gachaId)) {
                            tempGachaList.push(earlistGacha.gachaId)
                            gachaImageList.push(await drawGachaDatablock(earlistGacha, `${server.serverNameFull}相关卡池`))
                        }
                    }
                }
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
        useEazyBG: false,
        BGimage,
        text: 'Card'
    })

    return buffer
}

export {
    drawCardDetail
}