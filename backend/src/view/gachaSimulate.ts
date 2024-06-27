import { Gacha } from "@/types/Gacha";
import { Card } from "@/types/Card";
import { drawCardIcon } from "@/components/card";
import { drawTitle } from "@/components/title";
import { Canvas } from 'skia-canvas';
import { drawTextWithImages, drawText } from "@/image/text";
import { outputFinalBuffer } from '@/image/output'
import { getServerByPriority, Server } from "@/types/Server";
import { drawDatablock } from "@/components/dataBlock";
import { resizeImage } from "@/components/utils";
import { drawGachaDatablock } from "@/components/dataBlock/gacha";

const maxWidth = 230 * 5
export async function drawRandomGacha(gacha: Gacha, times: number = 10, compress: boolean): Promise<Array<Buffer | string>> {
    if (times > 10000) {
        return ['错误: 抽卡次数过多, 请不要超过10000次']
    }
    if (!gacha.isExist) {
        return ['错误: 该卡池不存在']
    }
    await gacha.initFull()
    let gachaImage: Canvas;
    if (times <= 10) {
        const cardImageList: Canvas[] = []
        for (let i = 0; i < times; i++) {
            cardImageList.push(await drawGachaCard(getGachaRandomCard(gacha, i)))
        }
        gachaImage = drawTextWithImages({
            textSize: 230,
            lineHeight: 230,
            content: cardImageList,
            maxWidth: maxWidth,
            spacing: 0,
        })
    }
    else {
        const gachaList: { [cardId: number]: number } = {};
        const promises: Promise<void>[] = [];

        for (let i = 0; i < times; i++) {
            promises.push(
                (async () => {
                    const card = getGachaRandomCard(gacha, i);
                    if (!gachaList[card.cardId]) {
                        gachaList[card.cardId] = 1;
                    } else {
                        gachaList[card.cardId]++;
                    }
                })()
            );
        }

        await Promise.all(promises);

        const cardImageList: Canvas[] = [];
        const cardIdList = Object.keys(gachaList);
        cardIdList.sort((a, b) => {
            const cardA = new Card(parseInt(a));
            const cardB = new Card(parseInt(b));
            return cardB.rarity - cardA.rarity;
        });

        const cardPromises: Promise<Canvas>[] = [];
        for (let i = 0; i < cardIdList.length; i++) {
            const cardId = cardIdList[i];
            if (Object.prototype.hasOwnProperty.call(gachaList, cardId)) {
                const card = new Card(parseInt(cardId));
                cardPromises.push(drawGachaCard(card, gachaList[cardId]));
            }
        }

        const cardImageResults = await Promise.all(cardPromises);
        cardImageList.push(...cardImageResults);

        gachaImage = drawTextWithImages({
            textSize: 115,
            lineHeight: 115,
            content: cardImageList,
            maxWidth: maxWidth,
            spacing: 0,
        });


    }

    const all = []
    all.push(drawTitle('卡池', '抽卡模拟'))
    all.push(drawDatablock({
        list: [gachaImage]
    }))
    //下方banner与ok按钮
    all.push(await drawGachaBanner(gacha))

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress: compress,
    })
    return [buffer]
}

//画抽卡模拟的卡牌
async function drawGachaCard(card: Card, numberOfCard: number = 1) {

    const cardIconWithId = await drawCardIcon({
        card: card,
        trainingStatus: false,
        cardTypeVisible: false,
        cardIdVisible: true,
    });
    if (numberOfCard > 1) {
        const canvas = new Canvas(230, 230);
        const ctx = canvas.getContext('2d');
        const maxTimes = Math.min(6, numberOfCard - 1);
        const cardIconWithoutId = await drawCardIcon({
            card: card,
            trainingStatus: false,
            cardTypeVisible: false,
            cardIdVisible: false,
        });
        for (let i = 1; i <= maxTimes; i++) {
            ctx.drawImage(cardIconWithoutId, 35 - ((maxTimes - i + 1) * 4), 20 - ((maxTimes - i + 1) * 4), 180, 180);
        }
        ctx.drawImage(cardIconWithId, 35, 20, 180, 210);
        const numberText = drawText({
            text: `x${numberOfCard}`,
            textSize: 30,
            maxWidth: 80,
            color: '#A7A7A7',
        })
        ctx.drawImage(numberText, 215 - numberText.width, 195);
        return canvas;
    }
    else {
        const canvas = new Canvas(230, 230);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cardIconWithId, 35, 20, 180, 200);
        return canvas;
    }

}

//从该卡池随机抽取一张卡牌,返回卡牌id,第10发保底
function getGachaRandomCard(gacha: Gacha, times: number) {
    const server = getServerByPriority(gacha.publishedAt)
    const gachaDetails = gacha.details[server]
    const gachaRates = gacha.rates[server]
    //计算稀有度
    let cardRarity = parseInt(getRandomRarity(gachaRates))
    if (times % 10 == 9 && cardRarity < 3) {//第十发保底
        cardRarity = 3
    }
    const rarityTotalWeight = gachaRates[cardRarity].weightTotal
    const cardId = getCardByWeight(cardRarity, rarityTotalWeight, gachaDetails)
    const card = new Card(parseInt(cardId))
    return card
}
function randomNumber(max: number) {
    return Math.random() * max
}
//根据权重随机抽取一张卡牌
function getCardByWeight(Rarity: number, totalWeight: number, cardWeightList: { [cardId: string]: { rarityIndex: number, weight: number } }) {
    const randomNum = randomNumber(totalWeight)
    let currentWeight = 0
    for (const key in cardWeightList) {
        if (cardWeightList.hasOwnProperty(key)) {
            if (cardWeightList[key].rarityIndex !== Rarity) {
                continue
            }
            const card = cardWeightList[key];
            currentWeight += card.weight
            if (randomNum < currentWeight) {
                return key
            }
        }
    }
}

//根据权重随机抽取稀有度
function getRandomRarity(rarities: { [rarity: string]: { rate: number, weightTotal: number } }): string | null {
    let totalRate = 0;
    // 计算所有几率的总和
    for (const key in rarities) {
        if (rarities.hasOwnProperty(key)) {
            totalRate += rarities[key].rate;
        }
    }

    // 生成一个 0 到总几率的随机数
    const randomNum = randomNumber(totalRate)

    let currentRate = 0;
    // 根据随机数落在的几率范围，返回对应的 rarity
    for (const key in rarities) {
        if (rarities.hasOwnProperty(key)) {
            const rarity = rarities[key];
            currentRate += rarity.rate;
            if (randomNum < currentRate) {
                return key;
            }
        }
    }
}

/*
const okButton = drawRoundedRectWithText({
    text: 'ok',
    textColor: '#FFFFFF',
    textSize: 60,
    color: '#FE3B73',
    textAlign: 'center',
    width: 280,
    height: 80,
    radius: 20,
    strokeColor: '#FFFFFF',
    strokeWidth: 5,
})
*/

//画下方的卡池Banner与抽卡按钮
async function drawGachaBanner(gacha: Gacha) {

    const gachaBannerImage = resizeImage({
        image: await drawGachaDatablock(gacha),
        widthMax: maxWidth / 2
    })
    const canvas = new Canvas(maxWidth + 200, gachaBannerImage.height);
    const ctx = canvas.getContext('2d');
    //ctx.drawImage(okButton, 1010, 0)
    ctx.drawImage(gachaBannerImage, 50, 0)
    return canvas
}

