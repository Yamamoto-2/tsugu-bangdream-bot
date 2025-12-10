import { Event } from '@/types/Event';
import { drawList, line } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { changeTimefomant } from '@/components/list/time';
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { Cutoff } from "@/types/Cutoff";
import { drawCutoffChart } from '@/components/chart/cutoffChart'
import { tierListOfServer } from '@/config';
import { drawEventDatablock } from '@/components/dataBlock/event';
import { drawTips } from '@/components/tips'
import { statusName } from '@/config';

export async function drawEventReportCutoffListOfEvent(eventId: number, mainServer: Server): Promise<Array<Buffer | string>> {
    var event = new Event(eventId)
    if (!event.isExist) {
        return ['活动不存在']
    }
    if (event.startAt[mainServer] == undefined) {
        return ['活动在该服务器不存在']
    }
    var all = []
    all.push(drawTitle('数据总览', '档线数据'))
    all.push(await drawEventDatablock(event, [mainServer]))

    const list: Array<Image | Canvas> = []

    //初始化档线列表
    var tierList = tierListOfServer[Server[mainServer]]
    var cutoffList: Array<Cutoff> = []
    for (var i in tierList) {
        var tempCutoff = new Cutoff(eventId, mainServer, tierList[i])
        await tempCutoff.initFull()
        if (tempCutoff.status == 'in_progress') {
            tempCutoff.predict()
        }
        cutoffList.push(tempCutoff)
    }
    //每个档线详细数据
    for (var i in cutoffList) {
        const cutoff = cutoffList[i]
        let cutoffContent: string[] = []
        if (cutoff.status == 'in_progress') {
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
            cutoffContent.push(`最终分数线:${cutoff.latestCutoff.ep.toString()}\n`)
        }


        list.push(drawList({
            key: `T${cutoff.tier}`,
            content: cutoffContent
        }))
        list.push(line)
    }
    list.pop()
    list.push(new Canvas(800, 50))

    //折线图
    list.push(await drawCutoffChart(cutoffList))

    //创建最终输出数组
    var listImage = drawDatablock({ list })

    all.push(listImage)

    all.push(drawTips({
        text: '数据提供者: 群238052000  bestdori.com',
    }))

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true
    })
    return [buffer]
}
