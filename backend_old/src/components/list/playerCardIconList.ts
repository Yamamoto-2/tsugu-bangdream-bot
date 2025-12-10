import { Card } from "@/types/Card";
import { Player } from "@/types/Player";
import { Canvas } from 'skia-canvas';
import { drawCardIcon } from "@/components/card";
import {drawList} from '@/components/list'

export async function drawPlayerCardInList(player: Player,key?:string,cardIdVisible = false,lineHeight = 184): Promise<Canvas> {
    let textSize = lineHeight / 200 * 180
    let spacing = lineHeight / 200 * 13
    if (cardIdVisible) {
        textSize / 180 * 30
        lineHeight / 200 * 230
    }
    const tempCardDataList = player.profile.mainDeckUserSituations.entries
    //将tempCardDataList调整顺序，为3,1,0,2,4
    const defaultCardSort = [3, 1, 0, 2, 4]
    const cardDataList = []
    for (let i = 0; i < defaultCardSort.length; i++) {
        const tempCardData = tempCardDataList[defaultCardSort[i]];
        cardDataList.push(tempCardData)
    }
    const cardIconList: Array<Canvas> = []
    for (let i in cardDataList) {
        const tempCardData = cardDataList[i]
        cardIconList.push(await drawCardIcon({
            card: new Card(tempCardData.situationId),
            trainingStatus: tempCardData.trainingStatus == 'done',
            illustTrainingStatus: tempCardData.illust == 'after_training',
            limitBreakRank: tempCardData.limitBreakRank,
            cardIdVisible: cardIdVisible,
            skillTypeVisible: true,
            cardTypeVisible: false,
            skillLevel: tempCardData.skillLevel,
        }))
    }
    return drawList({
        key: key,
        content: cardIconList,
        textSize: textSize,
        lineHeight: lineHeight,
        spacing: spacing
    })
}