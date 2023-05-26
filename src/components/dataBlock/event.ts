import { Event } from "../../types/Event";
import { drawListWithLine, drawListByServerList } from "../list";
import { drawDatablock } from '../dataBlock'
import { drawCharacterInList } from '../list/character'
import { drawAttributeInList } from "../list/attribute";
import { drawTimeInList } from "../list/time";
import { drawText } from "../text";
import { createCanvas, Image, Canvas } from "canvas";
import { draweventBannerImageCanvas } from './utils'

export async function drawEventDatablock(event: Event, topLeftText?: string) {
    var list = []
    var eventBannerImage = await event.getBannerImage()
    var eventBannerImageCanvas = draweventBannerImageCanvas(eventBannerImage)
    list.push(eventBannerImageCanvas)

    var textImageList: Array<Canvas> = []
    /*
    //活动名称
    textImageList.push(await drawListByServerList({
        content: event.eventName
    }))
    */

    //活动类型与ID
    textImageList.push(drawText({
        text: `${event.getTypeName()}   ID: ${event.eventId}`,
        maxWidth: 800
    }))


    //活动加成
    //attribute
    var attributeList = event.getAttributeList()
    for (const i in attributeList) {
        if (Object.prototype.hasOwnProperty.call(attributeList, i)) {
            const element = attributeList[i];
            textImageList.push(await drawAttributeInList({
                content: element,
                text: ` + ${i}%`
            }))
        }
    }
    //character 
    var characterList = event.getCharacterList()
    for (const i in characterList) {
        if (Object.prototype.hasOwnProperty.call(characterList, i)) {
            const element = characterList[i];
            textImageList.push(await drawCharacterInList({
                content: element,
                text: ` + ${i}%`
            }))
        }
    }

    /*
    //活动时间
    textImageList.push(await drawTimeInList({
        content: event.startAt
    }))
    */

    //画左侧有竖线的排版
    var textImageListImage = drawListWithLine(textImageList)
    list.push(textImageListImage)

    return (drawDatablock({ list, topLeftText }))
}
