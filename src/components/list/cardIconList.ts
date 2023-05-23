import { drawList } from '../list'
import { Canvas } from 'canvas'
import { drawCardIcon } from '../card'
import { Card } from '../../types/Card'

interface CardIconInListOptions {
    key: string;
    cardList: Array<Card>;
    cardIdVisible?: boolean;
    skillTypeVisible?: boolean;
    cardTypeVisible?: boolean;
    trainingStatus?: boolean;
}

export async function drawCardListInList({
    key,
    cardList,
    cardIdVisible = true,
    skillTypeVisible = true,
    cardTypeVisible = true,
    trainingStatus
}: CardIconInListOptions) {
    var lineHeight = 200
    var textSize = 180
    var spacing = 39 / 3
    if (cardIdVisible) {
        lineHeight += 30
        textSize += 30
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
        key:key,
        content:list,
        textSize:textSize,
        lineHeight:lineHeight,
        spacing:spacing
    })
}
