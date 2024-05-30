import { getEventGachaAndCardList } from '@/view/eventDetail'
import { Card } from '@/types/Card'
import { Skill } from '@/types/Skill';
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { drawCardIllustration } from '@/components/card';
import { drawSkillInList } from '@/components/list/skill'
import { drawCardPrefixInList } from '@/components/list/cardPrefix'
import { drawCardStatInList } from '@/components/list/stat'
import { drawCardListInList } from '@/components/list/cardIconList'
import { drawSdcharaInList } from '@/components/list/cardSdchara'
import { Image, Canvas } from 'skia-canvas'
import { Server } from '@/types/Server';
import { outputFinalBuffer } from '@/image/output'
import { Event } from '@/types/Event';
import { drawArticleTitle1 } from '@/components/article/title'

//illustration: 是否只获取插画
export async function drawEventPreviewCards(eventId: number, illustration: boolean = false): Promise<Array<Buffer | string>> {

    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    const result = []


    const title = await drawArticleTitle1('活动卡牌', 'Cards', event, true)
    result.push(await title.toBuffer('png'))

    //卡池卡牌
    const eventGachaAndCardList = await getEventGachaAndCardList(event, Server.jp)
    let cardList = eventGachaAndCardList.gachaCardList
    //活动卡牌
    for (let i = 0; i < event.rewardCards.length; i++) {
        const cardId = event.rewardCards[i];
        cardList.push(new Card(cardId))
    }
    //用cardId排序
    cardList.sort((a, b) => {
        return b.rarity - a.rarity
    })
    /*
    for(let i=0;i<cardList.length;i++){
        const card = cardList[i]
        const cardImage = await drawCardDetail(card.cardId, [Server.tw, Server.jp])
        result.push(cardImage)
    }
    */

    //如果只获取插画
    if (illustration) {
        const cardImages: Buffer[] = []
        for (let i = 0; i < cardList.length; i++) {
            const card = cardList[i]
            const trainingStatusList = card.getTrainingStatusList()
            for (let j = 0; j < trainingStatusList.length; j++) {
                const trainingStatus = trainingStatusList[j]
                cardImages.push(await card.getCardIllustrationImageBuffer(trainingStatus))
            }
        }
        return cardImages
    }
    //如果获取全部
    else {
        const eventBGImage = await event.getEventBGImage()

        const promises = []
        for (let i = 0; i < cardList.length; i++) {
            const card = cardList[i]
            promises.push(drawEventCardDetail(card.cardId, [Server.cn, Server.jp, Server.tw], eventBGImage))
        }
        const cardImages = await Promise.all(promises)
        result.push(...cardImages)
        return result
    }
}

async function drawEventCardDetail(cardId: number, displayedServerList: Server[], eventBGImage?: Image): Promise<string | Buffer> {
    const card = new Card(cardId)
    if (!card.isExist) {
        return '错误: 卡牌不存在'
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
                if (i == 'gacha' && card.rarity > 2) {
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

    /*
    //发售日期
    list.push(await drawTimeInList({
        key: '发布日期',
        content: card.releasedAt
    }, displayedServerList))
    list.push(line)
    */

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
    all.push(listImage)

    if (card.rarity < 3) {
        var BGimage = eventBGImage
    }
    else {
        var BGimage = await card.getCardIllustrationImage(true)
    }

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: false,
        BGimage,
        text: 'Cards'
    })
    return buffer
}



