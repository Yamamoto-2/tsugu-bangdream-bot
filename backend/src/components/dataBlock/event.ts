import { Event } from "@/types/Event";
import { drawListWithLine, drawList } from "@/components/list";
import { drawDatablock } from '@/components/dataBlock'
import { drawCharacterInList } from '@/components/list/character'
import { drawAttributeInList } from "@/components/list/attribute";
import { Canvas } from 'skia-canvas';
import { drawBannerImageCanvas } from '@/components/dataBlock/utils'
import { drawTimeInList } from '@/components/list/time'
import { Server } from '@/types/Server';
import { globalDefaultServer } from '@/config'

export async function drawEventDatablock(event: Event, displayedServerList: Server[] = globalDefaultServer, topLeftText?: string) {
    await event.initFull()
    var list = []
    var eventBannerImage = await event.getBannerImage()
    var eventBannerImageCanvas = drawBannerImageCanvas(eventBannerImage)
    list.push(eventBannerImageCanvas)

    var textImageList: Array<Canvas> = []
    /*
    //活动名称
    textImageList.push(await drawListByServerList({
        content: event.eventName
    }))
    */

    //活动类型与ID
    textImageList.push(drawList({
        text: `${event.getTypeName()}   ID: ${event.eventId}`
    }))


    //活动加成
    //attribute
    var attributeList = event.getAttributeList()
    for (const i in attributeList) {
        if (Object.prototype.hasOwnProperty.call(attributeList, i)) {
            const element = attributeList[i];
            textImageList.push(await drawAttributeInList({
                content: element,
                text: ` +${i}%`
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
                text: ` +${i}%`
            }))
        }
    }

    //活动时间
    textImageList.push(await drawTimeInList({
        content: event.startAt,
        eventId: event.eventId,
        estimateCNTime: true
    }, displayedServerList))

    //画左侧有竖线的排版
    var textImageListImage = drawListWithLine(textImageList)
    list.push(textImageListImage)

    return (drawDatablock({ list, topLeftText }))
}
