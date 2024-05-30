import { readExcelFile } from '@/types/utils'
import { configPath } from '@/config';
import { Event, getRecentEventListByEventAndServer } from '@/types/Event';
import { Server } from '@/types/Server';
import { drawPlayerNumberChart } from '@/components/chart/playerNumberChart';
import { drawTitle } from '@/components/title'
import { drawDatablock } from '@/components/dataBlock';
import { drawTips } from '@/components/tips';
import { outputFinalBuffer } from '@/image/output';

export async function drawEventReportPlayerNumber(eventId: number, mainServer: Server): Promise<Array<Buffer | string>> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    await event.initFull()
    const playerNumberList: {
        '活动编号': number,
        '开始时间': number,
        '结束时间': number,
        '当期人数': number,
        '封挂数': string,
        '活动类型': string,
    }[] = await readExcelFile(`${configPath}/playerNumber.xlsx`)

    const recentEventCount = 10
    const recentEventList = getRecentEventListByEventAndServer(event, mainServer, recentEventCount, false)
    const recentEvenrPlayerNumberList = []
    for (let i = 0; i < recentEventList.length; i++) {
        const element = recentEventList[i];
        const playerNumber = playerNumberList.find((value) => {
            return value['活动编号'] == element.eventId
        })
        if (playerNumber) {
            recentEvenrPlayerNumberList.push({
                evrntId: element.eventId,
                playerNumber: playerNumber['当期人数']
            })
        }
    }

    recentEvenrPlayerNumberList.reverse()

    const all = []
    all.push(drawTitle('数据总览', `玩家人数(探底数据)`))
    let list = []
    list.push(await drawPlayerNumberChart(recentEvenrPlayerNumberList))
    all.push(drawDatablock({
        list,
    }))
    all.push(drawTips({
        text: '数据提供者: @Minipig233',
    }))

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true
    })

    return [buffer];
}