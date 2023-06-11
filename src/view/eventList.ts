import { h, Element,Session } from 'koishi'
import { Card } from "../types/Card";
import mainAPI from "../types/_Main"
import { match } from "../commands/fuzzySearch"
import { Canvas, createCanvas, Image, loadImage } from "canvas"
import { drawDatablock, drawDatablockHorizontal } from '../components/dataBlock';
import { line } from '../components/list';
import { stackImage, stackImageHorizontal, resizeImage } from '../components/utils'
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'
import { Server, getIcon } from '../types/Server'
import { Event, sortEventList } from '../types/Event';
import { drawCardListInList } from '../components/list/cardIconList';
import { changeTimefomant } from '../components/list/time';
import { drawTextWithImages } from '../components/text';
import { getEventGachaAndCardList } from './eventDetail'
import { drawDottedLine } from '../image/dottedLine'
import { statConfig } from '../components/list/stat'
import { globalDefaultServer } from '../config';

const maxHeight = 7000
const maxColumns = 7

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

export async function drawEventList(matches: { [key: string]: string[] }, defaultServerList: Server[] = globalDefaultServer,session:Session) {
    //计算模糊搜索结果
    var tempEventList: Array<Event> = [];//最终输出的活动列表
    var eventIdList: Array<number> = Object.keys(mainAPI['events']).map(Number);//所有活动ID列表
    for (let i = 0; i < eventIdList.length; i++) {
        const tempEvent = new Event(eventIdList[i]);
        var isMatch = match(matches, tempEvent, []);
        // 如果在所有所选服务器列表中都不存在，则不输出
        var numberOfNotReleasedServer = 0;
        for (var j = 0; j < defaultServerList.length; j++) {
            var server = defaultServerList[j];
            if (tempEvent.startAt[server] == null) {
                numberOfNotReleasedServer++;
            }
        }
        if (numberOfNotReleasedServer == defaultServerList.length) {
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
    sortEventList(tempEventList)

    var tempEventImageList: Canvas[] = []
    var eventImageListHorizontal: Canvas[] = []
    var tempH = 0
    for (var i = 0; i < tempEventList.length; i++) {
        var tempImage = await drawEventInList(tempEventList[i], defaultServerList)
        tempH += tempImage.height
        if (tempH > maxHeight) {
            tempEventImageList.pop()
            eventImageListHorizontal.push(stackImage(tempEventImageList))
            eventImageListHorizontal.push(line2)
            tempEventImageList = []
            tempH = tempImage.height
        }
        tempEventImageList.push(tempImage)
        tempEventImageList.push(line)
        if (i == tempEventList.length - 1) {
            tempEventImageList.pop()
            eventImageListHorizontal.push(stackImage(tempEventImageList))
            eventImageListHorizontal.push(line2)
        }
    }
    eventImageListHorizontal.pop()


    if(eventImageListHorizontal.length > maxColumns){
        let times = 0
        let tempImageList = []
        for (let i = 0; i < eventImageListHorizontal.length; i++) {
            const tempCanv = eventImageListHorizontal[i];
            if(tempCanv == line2){
                continue
            }
            const all = []
            if(times = 0){
                all.push(drawTitle('查询', '活动列表'))
            }
            all.push(drawDatablock({list:[tempCanv]}))
            const buffer = await outputFinalBuffer({
                imageList: all,
                useEasyBG: true
            })
            tempImageList.push(h.image(buffer, 'image/png'))  
            times += 1
        }
        session.send(tempImageList)
        return '活动列表过长，已经拆分输出'
    }else{
        const all = []
        const eventListImage = drawDatablockHorizontal({
            list: eventImageListHorizontal
        })
        all.push(drawTitle('查询', '活动列表'))
        all.push(eventListImage)
        const buffer = await outputFinalBuffer({
            imageList: all,
            useEasyBG: true
        })
        return h.image(buffer, 'image/png')
    }

}

async function drawEventInList(event: Event, defaultServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    await event.initFull(false)
    var textSize = 25 * 3 / 4;
    var content = []
    //活动类型
    content.push(`ID: ${event.eventId.toString()}  ${await event.getTypeName()}\n`)
    //活动时间
    var numberOfServer = Math.min(defaultServerList.length, 2)
    for (var i = 0; i < numberOfServer; i++) {
        let server = defaultServerList[i]
        content.push(await getIcon(server), `${changeTimefomant(event.startAt[server])} - ${changeTimefomant(event.endAt[server])}\n`)
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

    //偏科，如果有的话
    if (Object.keys(event.eventCharacterParameterBonus).length != 0) {
        var statText = ''
        for (const i in event.eventCharacterParameterBonus) {
            if (i == 'eventId') {
                continue
            }
            if (Object.prototype.hasOwnProperty.call(event.eventCharacterParameterBonus, i)) {
                const element = event.eventCharacterParameterBonus[i];
                if (element == 0) {
                    continue
                }
                statText += ` ${statConfig[i].name} +${element}%`
            }
        }
        content.push(statText)
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

    //活动期间卡池卡牌
    var cardList: Card[] = []
    var cardIdList: number[] = []//用于去重
    for (var i = 0; i < defaultServerList.length; i++) {
        var server = defaultServerList[i]
        var EventGachaAndCardList = await getEventGachaAndCardList(event, server)
        var tempGachaCardList = EventGachaAndCardList.gachaCardList
        for (let i = 0; i < tempGachaCardList.length; i++) {
            const tempCard = tempGachaCardList[i];
            if (cardIdList.indexOf(tempCard.cardId) != -1) {
                continue
            }
            cardIdList.push(tempCard.cardId)
            cardList.push(tempCard)
        }
    }
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