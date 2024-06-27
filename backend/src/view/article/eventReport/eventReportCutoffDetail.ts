import { Event, getRecentEventListByEventAndServer } from '@/types/Event';
import { drawList, line } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { Cutoff } from "@/types/Cutoff";
import { drawCutoffChart } from '@/components/chart/cutoffChart'
import { serverNameFullList } from '@/config';
import { drawTips } from '@/components/tips'
import { drawCutoffHistoryChart } from '@/components/chart/cutoffHistoryChart'

export async function drawEventReportCutoffDetail(eventId: number, tier: number, mainServer: Server): Promise<Array<Buffer | string>> {
    var cutoff = new Cutoff(eventId, mainServer, tier)
    if (cutoff.isExist == false) {
        return [`错误: ${serverNameFullList[mainServer]} 活动或档线不存在`]
    }
    await cutoff.initFull()

    if (!cutoff.isExist) {
        return ['错误: 活动或档线数据错误']
    }

    var all = []
    all.push(drawTitle('档线分析', `${serverNameFullList[mainServer]} ${cutoff.tier}`))
    var list: Array<Image | Canvas> = []
    var event = new Event(eventId)
    await event.initFull(false)

    //最新分数线
    list.push(drawList({
        key: '实时档线',
        content: [`最终档线: ${cutoff.latestCutoff.ep.toString()}`],
        textSize: 30,
    }))

    //折线图
    list.push(await drawCutoffChart([cutoff]))
    list.push(line)

    //初始化档线列表
    let cutoffList: Array<Cutoff> = []
    const eventList = getRecentEventListByEventAndServer(event, mainServer, 5, true)
    for (let i = eventList.length - 1; i >= 0; i--) {
        const cutoff = new Cutoff(eventList[i].eventId, mainServer, tier)
        await cutoff.initFull()
        cutoffList.push(cutoff)
    }

    list.push(drawList({
        key: '近期同类型活动档线对比',
        content: [`活动类型: ${event.getTypeName()}`],
        textSize: 30,
    }))

    //每个档线详细数据
    list.push(await drawCutoffChart(cutoffList, true, mainServer))

    list.push(line)

    //近期活动档线对比
    list.push(drawList({
        key: '近期活动档线变化',
    }))

    const recentEventCount = 10
    let recentEventCutoffList: Array<Cutoff> = []
    const recentEventList = getRecentEventListByEventAndServer(event, mainServer, recentEventCount, false)
    for (let i = recentEventList.length - 1; i >= 0; i--) {
        const cutoff = new Cutoff(recentEventList[i].eventId, mainServer, tier)
        await cutoff.initFull()
        recentEventCutoffList.push(cutoff)
    }
    list.push(await drawCutoffHistoryChart(recentEventCutoffList))

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

    return [buffer];

}
