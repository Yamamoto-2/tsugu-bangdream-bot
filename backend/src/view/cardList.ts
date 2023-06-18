import { Card } from "../types/Card";
import { Attribute } from "../types/Attribute";
import { Character } from "../types/Character";
import mainAPI from "../types/_Main"
import { match } from "../routers/fuzzySearch"
import { Canvas, createCanvas, Image, loadImage } from 'canvas'
import { drawCardIcon } from "../components/card"
import { drawDatablock, drawDatablockHorizontal } from '../components/dataBlock';
import { stackImage, stackImageHorizontal } from '../components/utils'
import { drawRoundedRect } from "../image/drawRect";
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'
import { Server } from '../types/Server'
import { globalDefaultServer } from '../config';

const maxWidth = 7000

export async function drawCardList(matches: { [key: string]: string[] }, defaultServerList: Server[] = globalDefaultServer): Promise<Array<Buffer | string>> {
    //计算模糊搜索结果
    var tempCardList: Array<Card> = [];//最终输出的卡牌列表
    var cardIdList: Array<number> = Object.keys(mainAPI['cards']).map(Number);//所有卡牌ID列表
    for (let i = 0; i < cardIdList.length; i++) {
        const tempCard = new Card(cardIdList[i]);
        if (tempCard.type == 'others') {
            continue;
        }
        var isMatch = match(matches, tempCard, ['scoreUpMaxValue']);
        //如果在所有所选服务器列表中都不存在，则不输出
        var numberOfNotReleasedServer = 0;
        for (var j = 0; j < defaultServerList.length; j++) {
            var server = defaultServerList[j];
            if (tempCard.releasedAt[server] == null) {
                numberOfNotReleasedServer++;
            }
        }
        if (numberOfNotReleasedServer == defaultServerList.length) {
            isMatch = false;
        }
        if (isMatch) {
            tempCardList.push(tempCard);
        }
    }
    if (tempCardList.length == 0) {
        return ['没有搜索到符合条件的卡牌']
    }

    //计算表格，X轴为颜色，Y轴为角色
    var characterIdList: number[] = [];
    var attributeList: Array<'cool' | 'happy' | 'pure' | 'powerful'> = [];
    for (let i = 0; i < tempCardList.length; i++) {
        const tempCard = tempCardList[i];
        if (!characterIdList.includes(tempCard.characterId)) {
            characterIdList.push(tempCard.characterId);
        }
        if (!attributeList.includes(tempCard.attribute)) {
            attributeList.push(tempCard.attribute);
        }
    }
    var cardListImage: Canvas;
    var characterIconImageList: Canvas[] = [];//角色头像列表，画在最左边
    //画角色头像Icon函数
    async function drawCharacterIcon(characterId: number | null): Promise<Canvas> {
        const tempCanvas = createCanvas(100, 140);
        const ctx = tempCanvas.getContext('2d');
        if (characterId == null) {
            return tempCanvas;
        }
        const character = new Character(characterId);
        const characterIcon = await character.getIcon();
        ctx.drawImage(characterIcon, 0, 25, 75, 75);
        return tempCanvas;
    }
    characterIdList.sort((a, b) => {
        return a - b;
    })
    //如果角色数量大于5，则颜色作为X轴，角色作为Y轴
    if (characterIdList.length > 5) {
        var tempAttributeImageList: Canvas[] = []//每一个颜色的所有角色的列
        for (let i = 0; i < attributeList.length; i++) {
            const attribute = attributeList[i];
            var tempAttributeCardImageList: Canvas[] = []//这个颜色的所有角色的行
            for (let j = 0; j < characterIdList.length; j++) {
                const characterId = characterIdList[j];
                var tempAttributeCardList = getCardListByAttributeAndCharacterId(tempCardList, attribute, characterId);
                tempAttributeCardImageList.push(await drawCardListLine(tempAttributeCardList));
                //画角色头像
                if (i == 0) {
                    characterIconImageList.push(await drawCharacterIcon(characterId));
                }
            }
            tempAttributeImageList.push(stackImage(
                tempAttributeCardImageList
            ));

        }
        const characterIconImage = stackImage(characterIconImageList);
        tempAttributeImageList.unshift(characterIconImage);
        cardListImage = drawDatablockHorizontal({
            list: tempAttributeImageList,
        })
        if (cardListImage.width > maxWidth) {
            let times = 0
            let tempImageList:Array<Buffer|string> = []
            tempImageList.push('卡牌列表过长，已经拆分输出')
            for (let i = 0; i < tempAttributeImageList.length; i++) {

                const tempCanv = tempAttributeImageList[i];
                if (tempCanv == characterIconImage) {
                    continue
                }
                const all = []
                all.push(drawDatablockHorizontal({ list: [characterIconImage, tempCanv] }))
                const buffer = await outputFinalBuffer({
                    imageList: all,
                    useEasyBG: true
                })
                tempImageList.push(buffer)
                times += 1
            }
            return tempImageList
        }
        var all = []
        all.push(drawTitle('查询', '卡牌列表'))
        all.push(cardListImage)
        var buffer = await outputFinalBuffer({
            imageList: all,
            useEasyBG: true
        })
        return [buffer]
    }
    else {
        var tempCardImageList: Canvas[] = []//总列
        for (let i = 0; i < characterIdList.length; i++) {
            const characterId = characterIdList[i];
            let icon = true
            for (let j = 0; j < attributeList.length; j++) {
                const attribute = attributeList[j];
                var tempAttributeCardList = getCardListByAttributeAndCharacterId(tempCardList, attribute, characterId);
                if (tempAttributeCardList.length != 0) {
                    tempCardImageList.push(await drawCardListLine(tempAttributeCardList));
                    //画角色头像
                    if (icon) {
                        characterIconImageList.push(await drawCharacterIcon(characterId));
                        icon = false
                    }
                    else {
                        characterIconImageList.push(await drawCharacterIcon(null));
                    }
                }
            }
        }
        const cardListImageWithoutCharacterIcon = await stackImage(
            tempCardImageList,
        )
        var characterIconImage = stackImage(characterIconImageList);
        cardListImage = drawDatablockHorizontal({ list: [characterIconImage, cardListImageWithoutCharacterIcon] });
        var all = []
        all.push(drawTitle('查询', '卡牌列表'))
        all.push(cardListImage)
        var buffer = await outputFinalBuffer({
            imageList: all,
            useEasyBG: true
        })
        return [buffer]
    }


}

function getCardListByAttributeAndCharacterId(cardFullList: Card[], attribute: 'cool' | 'happy' | 'pure' | 'powerful', characterId: number) {
    var cardList: Card[] = [];
    for (let i = 0; i < cardFullList.length; i++) {
        const tempCard = cardFullList[i];
        if (tempCard.attribute == attribute && tempCard.characterId == characterId) {
            cardList.push(tempCard);
        }
    }
    return cardList;
}


//每个颜色和角色的一行
async function drawCardListLine(cardList: Card[]) {
    if (cardList.length == 0) {
        return createCanvas(1, 140);
    }
    const maxX = cardList.length * 140
    const maxY = 140
    const canvas = createCanvas(maxX, maxY)
    const ctx = canvas.getContext('2d')
    //排序，稀有度高的在前面，其中技能加成高的在前面
    cardList.sort((a, b) => {
        if (a.rarity > b.rarity) {
            return -1
        }
        if (a.scoreUpMaxValue > b.scoreUpMaxValue) {
            return -1
        }
        return 0
    })
    //画卡牌，从左到右，宽度120，间隔20
    for (let i = 0; i < cardList.length; i++) {
        const tempCard = cardList[i];
        const cardIcon = await drawCardIcon({
            card: tempCard,
            trainingStatus: true,
            cardIdVisible: true,
            skillTypeVisible: true
        })
        var ratio = 120 / cardIcon.width
        ctx.drawImage(cardIcon, i * 140, 0, cardIcon.width * ratio, cardIcon.height * ratio)
    }
    return canvas
}
