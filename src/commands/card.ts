import { Card } from '../types/Card'
import { Character } from '../types/Character';
import { Attribute } from '../types/Attribute';
import { Skill } from '../types/Skill';
import { drawList, drawDatablock, line, drawListByServerList, drawTips } from '../components/list';
import {  drawCardIllustration } from '../components/card';
import { drawCharacterInList } from '../components/list/character'
import { drawAttributeInList } from '../components/list/attribute'
import { drawRarityInList } from '../components/list/rarity'
import { drawSkillInList } from '../components/list/skill'
import { drawTimeInList } from '../components/list/time';
import { drawCardPrefixInList } from '../components/list/cardPrefix'
import { drawCardStatInList } from '../components/list/cardStat'
import { drawCardListInList } from '../components/list/cardIconList'
import {drawSdcharaInList} from '../components/list/cardSdchara'
import { Image, Canvas, createCanvas } from 'canvas'
import { Server } from '../types/Server';
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'

async function drawCardDetail(cardId: number, server: Server = new Server("cn")): Promise<Buffer> {
    const card = new Card(cardId)
    await card.initFull()
    var list: Array<Image | Canvas> = []
    list.push(await drawCardPrefixInList(card))
    var trainingStatusList = card.getTrainingStatusList()
    list.push(createCanvas(1000, 30))
    for (let i = 0; i < trainingStatusList.length; i++) {
        const element = trainingStatusList[i];
        list.push(await drawCardIllustration({
            card: card,
            trainingStatus: element,
            isList: true
        }))
        list.push(createCanvas(1000, 30))
    }

    //综合力
    list.push(await drawCardStatInList(card))
    list.push(line)

    //类型
    list.push(drawList({
        key: '类型', text: card.getTypeName()
    }))
    list.push(line)

    //角色
    var character = new Character(card.characterId)
    list.push(await drawCharacterInList({ content: [character] }))
    list.push(line)

    //属性
    var attribute = new Attribute(card.attribute)
    list.push(await drawAttributeInList({ content: attribute }))
    list.push(line)

    //稀有度
    list.push(await drawRarityInList({ rarity: card.rarity }))
    list.push(line)

    //技能
    var skill = new Skill(card.skillId)
    list.push(await drawSkillInList({ card: card, content: skill }))
    list.push(line)

    //招募语
    var gachaText = card.gachaText
    list.push(await drawListByServerList({
        key: '招募语',
        content: gachaText,
    }))
    list.push(line)

    //发售日期
    list.push(await drawTimeInList('发布日期', card.releasedAt))
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
    list.push(line)

    //卡牌ID
    list.push(drawList({
        key: 'ID', text: card.cardId.toString()
    }))

    //最终输出
    var listImage = await drawDatablock(list)
    var all = []
    all.push(drawTitle('查询', '卡牌'))
    all.push(listImage)
    var buffer = await outputFinalBuffer(all, 'Card', await card.getCardIllustrationImage(true))
    return buffer
}

export {
    drawCardDetail
}