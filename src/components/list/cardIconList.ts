import { drawList } from '../list'
import { Canvas } from 'canvas'
import { drawCardIcon } from '../card'
import { Card } from '../../types/Card'

interface CardIconInListOptions {
    key?: string;
    cardList: Array<Card>;
    cardIdVisible?: boolean;
    skillTypeVisible?: boolean;
    cardTypeVisible?: boolean;
    trainingStatus?: boolean;
    lineHeight?: number;
}

export async function drawCardListInList({
    key,
    cardList,
    cardIdVisible = false,
    skillTypeVisible = true,
    cardTypeVisible = true,
    trainingStatus,
    lineHeight = 200
}: CardIconInListOptions) {
    var textSize = lineHeight / 200 * 180
    var spacing = lineHeight / 200 * 13
    if (cardIdVisible) {
        textSize / 180 * 30
        lineHeight / 200 * 230
    }
    var list: Array<Canvas> = []
    for (let i = 0; i < cardList.length; i++) {
        const element: Card = cardList[i];
        var cardIcon: Canvas
        if (trainingStatus != undefined) {
            cardIcon = await drawCardIcon({
                card: element,
                trainingStatus: trainingStatus,
                cardIdVisible: cardIdVisible,
                skillTypeVisible: skillTypeVisible,
                cardTypeVisible: cardTypeVisible,
            })
            list.push(cardIcon)
        }
        else {
            var getTrainingStatusList = element.getTrainingStatusList()
            for (let j = 0; j < getTrainingStatusList.length; j++) {
                cardIcon = await drawCardIcon({
                    card: element,
                    trainingStatus: getTrainingStatusList[j],
                    cardIdVisible: cardIdVisible,
                    skillTypeVisible: skillTypeVisible,
                    cardTypeVisible: cardTypeVisible,
                })
                list.push(cardIcon)
            }
        }
    }
    return drawList({
        key: key,
        content: list,
        textSize: textSize,
        lineHeight: lineHeight,
        spacing: spacing
    })
}
