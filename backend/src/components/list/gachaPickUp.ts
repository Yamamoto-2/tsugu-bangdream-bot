import { Gacha } from "@/types/Gacha"
import { Server } from "@/types/Server"
import { drawList, line } from "@/components/list"
import { drawCardListInList } from '@/components/list/cardIconList'
import { Card } from "@/types/Card"
import { stackImage } from '@/components/utils'
import { Canvas } from 'skia-canvas'

export async function drawGachaPickupInList(gacha: Gacha, server: Server, key?: string): Promise<Canvas> {
    const list = []
    list.push(drawList({
        key: key ?? '卡池PickUp',
    }))
    var pickUpCardIdList = []
    var details = gacha.details[server]
    for (var cardId in details) {
        if (details[cardId]['pickup'] == true) {
            pickUpCardIdList.push(parseInt(cardId))
        }
    }
    //pickup按照稀有度和概率分类， pickUpCardList:{rarity:{weight:[card]}
    pickUpCardIdList = Array.from(new Set(pickUpCardIdList))
    var pickUpCardList = {}
    for (var i = 0; i < pickUpCardIdList.length; i++) {
        var card = new Card(pickUpCardIdList[i])
        const rarity = card.rarity.toString()
        const weight = (details[pickUpCardIdList[i]]['weight']).toString()
        if (!pickUpCardList[rarity]) {
            pickUpCardList[rarity] = {}
            if (!pickUpCardList[rarity][weight]) {
                pickUpCardList[rarity][weight] = []
            }
        }
        pickUpCardList[rarity][weight].push(card)
    }
    if (Object.keys(pickUpCardList).length != 0) {
        for (let rarity in pickUpCardList) {
            for (let weight in pickUpCardList[rarity]) {
                const rate = parseInt(weight) / gacha.rates[server][rarity].weightTotal * gacha.rates[server][rarity].rate
                list.push(drawList({
                    text: `${rate.toFixed(2)}%: `,
                }))
                list.push(await drawCardListInList({
                    cardList: pickUpCardList[rarity][weight],
                    trainingStatus: false,
                    cardIdVisible: true,
                    cardTypeVisible: true,
                    skillTypeVisible: true,
                }))
            }
        }
        return stackImage(list)
    }
    else {
        const result = drawList({
            key: key ?? '卡池PickUp',
            text: '无'
        })
        return result
    }
} 