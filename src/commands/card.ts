import { Card } from '../types/Card'
import { Character } from '../types/Character';
import { Attribute } from '../types/Attribute';
import { Skill } from '../types/Skill';
import { drawList, drawDatablock, line, drawListByServerList, drawTips } from '../components/list';
import { drawCardIcon, drawCardIllustration } from '../components/card';
import { drawCharacterInList } from '../components/list/character'
import { drawAttributeInList } from '../components/list/attribute'
import { drawRarityInList } from '../components/list/rarity'
import { drawSkillInList } from '../components/list/skill'
import { drawTimeInList } from '../components/list/time';
import {drawCardPrefixInList} from '../components/list/cardPrefix'
import { Image, Canvas, createCanvas } from 'canvas'
import { Server } from '../types/Server';
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'

async function drawCardDetail(cardId: number): Promise<Buffer> {
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
            trainningStatus: element,
            isList: true
        }))
        list.push(createCanvas(1000, 30))
    }

    list.push(drawList({
        key: '类型', text: card.getTypeName()
    }))
    list.push(line)

    var character = new Character(card.characterId)
    list.push(await drawCharacterInList({ content: [character] }))
    list.push(line)

    var attribute = new Attribute(card.attribute)
    list.push(await drawAttributeInList({ content: attribute }))
    list.push(line)

    list.push(await drawRarityInList({ rarity: card.rarity }))
    list.push(line)

    var skill = new Skill(card.skillId)
    list.push(await drawSkillInList({ card: card, content: skill }))
    list.push(line)

    list.push(await drawTimeInList('发布日期', card.releasedAt))
    list.push(line)

    list.push(drawList({
        key: 'ID', text: card.cardId.toString()
    }))


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