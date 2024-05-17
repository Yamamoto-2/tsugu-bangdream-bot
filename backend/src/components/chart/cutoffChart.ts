import { Canvas } from 'skia-canvas';
import { Cutoff } from "@/types/Cutoff";
import { drawTimeLineChart } from "@/components/chart_Timeline";
import { Event } from '@/types/Event';
import { Server } from '@/types/Server';
import { CutoffEventTop } from '@/types/CutoffEventTop';
import { getPresetColor } from '@/types/Color';
import { drawList } from '@/components/list'
import { stackImage } from '@/components/utils'

export async function drawCutoffChart(cutoffList: Cutoff[], setStartToZero = false, server: Server = Server['jp']) {
    //setStartToZero:是否将开始时间设置为0
    var datasets = []
    var time = new Date().getTime()
    if (cutoffList.length == 0) {
        return (new Canvas(1, 1))
    }

    const list = []

    var onlyOne = cutoffList.length == 1
    for (let i = 0; i < cutoffList.length; i++) {
        const tempColor = getPresetColor(i)

        const cutoff = cutoffList[i];
        const tempEvent = new Event(cutoff.eventId)

        let lableName: string
        if (setStartToZero) {
            lableName = `[${tempEvent.eventId}] ${tempEvent.eventName[server]} T${cutoff.tier}`
            list.push(drawList({
                content: [tempColor.generateColorBlock(0.8), `[${tempEvent.eventId}] ${tempEvent.eventName[server]} T${cutoff.tier}`],
                textSize: 20,
            }))
        }
        else {
            lableName = `T${cutoff.tier}`
            list.push(drawList({
                content: [tempColor.generateColorBlock(0.8), `T${cutoff.tier}`],
                textSize: 20,
            }))
        }
        datasets.push({
            label: lableName,
            data: cutoff.getChartData(setStartToZero),
            borderWidth: 5,
            borderColor: [tempColor.getRGBA(1)],
            backgroundColor: [tempColor.getRGBA(0.2)],
            pointBackgroundColor: tempColor.getRGBA(1),
            pointBorderColor: tempColor.getRGBA(1),
            fill: onlyOne
        })

        if (cutoff.status == 'in_progress') {
            if (cutoff.predictEP != null && cutoff.predictEP != 0) {
                let data = []
                if (setStartToZero) {
                    data = [{ x: new Date(0), y: cutoff.predictEP }, { x: new Date(cutoff.endAt - cutoff.startAt), y: cutoff.predictEP }]
                }
                else {
                    data = [{ x: new Date(cutoff.startAt), y: cutoff.predictEP }, { x: new Date(cutoff.endAt), y: cutoff.predictEP }]
                }
                const tempColor = getPresetColor(i)
                datasets.push({
                    label: `T${cutoff.tier} 预测线`,
                    borderColor: [tempColor.getRGBA(1)],
                    backgroundColor: [tempColor.getRGBA(1)],
                    data: data,
                    borderWidth: 5,
                    borderDash: [20, 10],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                })


            }

        }
    }
    if (!setStartToZero) {
        if (time < cutoffList[0].endAt) {
            const tempColor = getPresetColor(0)
            datasets.push({
                label: "当前时间",
                borderColor: [tempColor.getRGBA(1)],
                backgroundColor: [tempColor.getRGBA(1)],
                data: [{ x: new Date(time), y: 0 }],
                fill: false,
                pointRadius: 10,
                pointHoverRadius: 15,
                showLine: false
            })
        }
    }
    let all = []
    all.push(stackImage(list))

    var data = {
        datasets: datasets
    }
    if (setStartToZero) {
        let longestTime = 0
        for (let i = 0; i < cutoffList.length; i++) {
            const cutoff = cutoffList[i];
            if (cutoff.endAt - cutoff.startAt > longestTime) {
                longestTime = cutoff.endAt - cutoff.startAt
            }
        }
        all.push(await drawTimeLineChart({ data, start: new Date(0), end: new Date(longestTime), setStartToZero }))
        return (stackImage(all))
    }
    else {
        all.push(await drawTimeLineChart({ data, start: new Date(cutoffList[0].startAt), end: new Date(cutoffList[0].endAt), setStartToZero }))
        return (stackImage(all))
    }

}
export async function drawCutoffEventTopChart(CutoffEventTop: CutoffEventTop, setStartToZero = false, server: Server = Server['jp']) {
    var datasets = []
    if (CutoffEventTop == undefined) {
        return (new Canvas(1, 1))
    }
    var allData = CutoffEventTop.getChartData();
    function removeBraces(text: string): string {
        var newText = text.replace(/\[[^\]]*\]/g, "");
        return newText;
    }
    let colorNumber = 0
    for (const key in allData) {
        const tempColor = getPresetColor(colorNumber)
        datasets.push({
            label: removeBraces(CutoffEventTop.getUserNameById(Number(key))),
            data: allData[key],
            borderWidth: 4,
            borderColor: [tempColor.getRGBA(1)],
            backgroundColor: [tempColor.getRGBA(0.2)],
            pointBackgroundColor: tempColor.getRGBA(0),
            pointBorderColor: tempColor.getRGBA(0),
            pointStyle: false,
            fill: false
        })
        colorNumber++
    }
    var data = { datasets: datasets }
    return await drawTimeLineChart({ data, start: new Date(CutoffEventTop.startAt), end: new Date(CutoffEventTop.endAt), setStartToZero }, true)
}