import { h, Element } from 'koishi'
import { Card } from "../types/Card";
import { Attribute } from "../types/Attribute";
import { Character } from "../types/Character";
import mainAPI from "../types/_Main"
import { match } from "../commands/fuzzySearch"
import { Canvas, createCanvas, Image, loadImage } from "canvas"
import { drawCardIcon } from "../components/card"
import { drawDatablock, drawDatablockHorizontal } from '../components/dataBlock';
import { drawListWithLine, line } from '../components/list';
import { stackImage, stackImageHorizontal, resizeImage } from '../components/utils'
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'
import { defaultserverList } from '../types/Server'
import { Event } from '../types/Event';
import { drawCardListInList } from '../components/list/cardIconList';
import { drawTimeInList, changeTimefomant } from '../components/list/time';
import { drawText, drawTextWithImages } from '../components/text';
import { getEventGachaAndCardList } from './eventDetail'
import { drawDottedLine } from '../image/dottedLine'

const maxHeight = 7000

//表格用默认虚线
export const line2: Canvas = drawDottedLine({
    width: 30,
    height: 7000,
    startX: 5,
    startY: 0,
    endX: 15,
    endY: 6995,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

export async function drawEventList(matches: { [key: string]: string[] }) {
    //计算模糊搜索结果
    var tempEventList: Array<Event> = [];//最终输出的活动列表
    var eventIdList: Array<number> = Object.keys(mainAPI['events']).map(Number);//所有活动ID列表
    for (let i = 0; i < eventIdList.length; i++) {
        const tempEvent = new Event(eventIdList[i]);
        var isMatch = match(matches, tempEvent, []);
        //如果在所有所选服务器列表中都不存在，则不输出
        var numberOfNotReleasedServer = 0;
        for (var j = 0; j < defaultserverList.length; j++) {
            var server = defaultserverList[j];
            if (server.getContentByServer(tempEvent.startAt) == null) {
                numberOfNotReleasedServer++;
            }
        }
        if (numberOfNotReleasedServer == defaultserverList.length) {
            isMatch = false;
        }
        if (isMatch) {
            tempEventList.push(tempEvent);
        }
    }
    if (tempEventList.length == 0) {
        return '没有搜索到符合条件的活动'
    }

    //按照开始时间排序
    tempEventList.sort((a, b) => {
        for (var i = 0; i < defaultserverList.length; i++) {
            var server = defaultserverList[i]
            if (a.startAt[server.serverId] != b.startAt[server.serverId]) {
                return a.startAt[server.serverId] - b.startAt[server.serverId]
            }
        }
    })
    var tempEventImageList: Canvas[] = []
    var eventImageListHorizontal: Canvas[] = []
    var tempH = 0
    for (var i = 0; i < tempEventList.length; i++) {
        var tempImage = await drawEventInList(tempEventList[i])
        tempH += tempImage.height
        if(tempH > maxHeight){
            tempEventImageList.pop()
            eventImageListHorizontal.push(stackImage(tempEventImageList))
            eventImageListHorizontal.push(line2)
            tempEventImageList = []
            tempH = tempImage.height
        }
        tempEventImageList.push(tempImage)
        tempEventImageList.push(line)
        if(i == tempEventList.length - 1 && eventImageListHorizontal.length == 0){
            eventImageListHorizontal.push(stackImage(tempEventImageList))
        }
    }
    if(eventImageListHorizontal.length > 1){
        eventImageListHorizontal.pop()
    }
    var eventListImage = await drawDatablockHorizontal({
        list: eventImageListHorizontal
    })

    var all = []
    all.push(drawTitle('查询', '活动列表'))
    all.push(eventListImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })
    console.log(defaultserverList)
    return h.image(buffer, 'image/png')
}

async function drawEventInList(event: Event): Promise<Canvas> {
    var textSize = 25 * 3 / 4;
    var content = []
    //活动类型
    content.push(`ID: ${event.eventId.toString()}  ${await event.getTypeName()}\n`)
    //活动时间
    var numberOfServer = Math.min(defaultserverList.length, 2)
    for (var i = 0; i < numberOfServer; i++) {
        let server = defaultserverList[i]
        content.push(await server.getIcon(), `${changeTimefomant(event.startAt[server.serverId])} - ${changeTimefomant(event.endAt[server.serverId])}\n`)
    }
    //活动加成
    //属性
    var attributeList = event.getAttributeList()
    for (var precent in attributeList) {
        for (var i = 0; i < attributeList[precent].length; i++) {
            content.push(await attributeList[precent][i].getIcon())
        }
        content.push(`+${precent}% `)
    }

    //角色
    var characterList = event.getCharacterList()
    for (var precent in characterList) {
        for (var i = 0; i < characterList[precent].length; i++) {
            content.push(await characterList[precent][i].getIcon())
        }
        content.push(`+${precent}% `)
    }

    var textImage = drawTextWithImages({
        content: content,
        textSize,
        maxWidth: 500
    })
    const eventBannerImage = resizeImage({
        image: await event.getBannerImage(),
        heightMax: 100
    })
    var imageUp = stackImageHorizontal([eventBannerImage, createCanvas(20, 1), textImage])
    var cardList = (await getEventGachaAndCardList(event)).gachaCardList
    var rewardCards = event.rewardCards
    for (var i = 0; i < rewardCards.length; i++) {
        cardList.push(new Card(rewardCards[i]))
    }
    var imageDown = await drawCardListInList({
        cardList: cardList,
        lineHeight: 120,
        trainingStatus: false,
        cardIdVisible: true,
    })
    return stackImage([imageUp, imageDown])
}