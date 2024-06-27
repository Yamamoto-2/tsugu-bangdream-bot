import { Event, getRecentEventListByEventAndServer } from '@/types/Event';
import { drawList, line } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { changeTimefomant } from '@/components/list/time';
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { Cutoff } from "@/types/Cutoff";
import { drawCutoffChart } from '@/components/chart/cutoffChart'
import { serverNameFullList } from '@/config';
import { drawEventDatablock } from '@/components/dataBlock/event';
import { drawAttributeInList } from '@/components/list/attribute'
import { drawCharacterInList } from '@/components/list/character'
import { loadImageFromPath } from '@/image/utils';

export async function drawCutoffListOfRecentEvent(eventId: number, tier: number, mainServer: Server, compress: boolean): Promise<Array<Buffer | string>> {
    //检查
    var event = new Event(eventId)
    if (!event.isExist) {
        return ['活动不存在']
    }
    if (event.startAt[mainServer] == undefined) {
        return ['活动在该服务器不存在']
    }
    var tempcutoff = new Cutoff(eventId, mainServer, tier)
    if (tempcutoff.isExist == false) {
        return [`错误: ${serverNameFullList[mainServer]} 活动或档线不存在`]
    }


    var all = []
    all.push(drawTitle('历史的档线对比', `${serverNameFullList[mainServer]} ${tier}档线`))
    all.push(await drawEventDatablock(event, [mainServer]))

    const list: Array<Image | Canvas> = []

    //初始化档线列表
    var cutoffList: Array<Cutoff> = []
    const eventList = getRecentEventListByEventAndServer(event, mainServer, 5, true)
    for (let i = eventList.length - 1; i >= 0; i--) {
        const cutoff = new Cutoff(eventList[i].eventId, mainServer, tier)
        await cutoff.initFull()
        cutoffList.push(cutoff)
    }
    //每个档线详细数据
    for (let i in cutoffList) {
        const cutoff = cutoffList[i]
        const tempEvent = new Event(cutoff.eventId)
        list.push(drawList({
            key: `ID:${cutoff.eventId} ${tempEvent.eventName[mainServer]}`,
        }))
        //添加活动粗略信息，包括Attribute，Charactor
        //attribute
        const attributeList = tempEvent.getAttributeList()
        for (const i in attributeList) {
            if (Object.prototype.hasOwnProperty.call(attributeList, i)) {
                const element = attributeList[i];
                list.push(await drawAttributeInList({
                    content: element,
                    text: ` +${i}%`
                }))
            }
        }
        //charactor
        const characterList = tempEvent.getCharacterList()
        for (const i in characterList) {
            if (Object.prototype.hasOwnProperty.call(characterList, i)) {
                const element = characterList[i];
                list.push(await drawCharacterInList({
                    content: element,
                    text: ` +${i}%`
                }))
            }
        }
        let cutoffContent: Array<Canvas | Image | string> = []

        //状态
        if (cutoff.status == 'in_progress') {
            cutoff.predict()
            let predictText: string
            if (cutoff.predictEP == null || cutoff.predictEP == 0) {
                predictText = '?'
            }
            else {
                predictText = cutoff.predictEP.toString()
            }
            cutoffContent.push(`当前预测线: ${predictText}\n`)
            cutoffContent.push(`最新分数线: ${cutoff.latestCutoff.ep.toString()}\n`)
            cutoffContent.push(`更新时间:${changeTimefomant(cutoff.latestCutoff.time)}`)
        }
        else if (cutoff.status == 'ended') {
            cutoffContent.push(`最终分数线: ${cutoff.latestCutoff.ep.toString()}\n`)
        }

        list.push(drawList({
            content: cutoffContent
        }))
        list.push(line)
    }
    list.pop()
    list.push(new Canvas(800, 50))

    //折线图
    list.push(await drawCutoffChart(cutoffList, true, mainServer))

    //创建最终输出数组
    var listImage = drawDatablock({ list })

    all.push(listImage)
    /*
    all.push(drawTips({
        text: '想给我们提供数据?\n可以在B站 @Tsugu_Official 的置顶动态留言\n或者在群238052000中提供数据\n也可以扫描右侧二维码进行上传\n手机可以长按图片扫描二维码\n我们会尽快将数据上传至服务器',
        image: await loadImageFromPath(path.join(assetsRootPath, 'shimowendang.png'))
    }))
    */
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress: compress,
    })
    return [buffer]
}