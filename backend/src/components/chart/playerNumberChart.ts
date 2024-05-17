import { drawLinegraphChart } from '@/components/chart_Bargraph'
import { stackImage } from '@/components/utils'
import { Cutoff } from '@/types/Cutoff'
import { Event } from '@/types/Event'
import { getServerByPriority } from '@/types/Server'
import { drawList } from '@/components/list'
import { Canvas } from 'skia-canvas'
import { getPresetColor } from '@/types/Color';



export async function drawPlayerNumberChart(playerNumberList: Array<{ evrntId: number, playerNumber: number }>): Promise<Canvas> {
    let labels: string[] = []//表格的横坐标
    let data: number[] = []
    let backgroundColor: string[] = []
    const list = []

    for (let i = playerNumberList.length - 1; i >= 0; i--) {
        const element = playerNumberList[i]
        labels.push(element.evrntId.toString())
        data.push(element.playerNumber)
        const event = new Event(element.evrntId)
        const server = getServerByPriority(event.eventName)
        const eventName = event.eventName[server]

        //颜色
        const tempColor = getPresetColor(i)
        backgroundColor.push(tempColor.getRGBA(0.8))
        list.push(drawList({
            content: [tempColor.generateColorBlock(0.8), `[${element.evrntId}] [${element.playerNumber}] ${eventName}`],
            textSize: 20,
        }))
    }
    let all = []
    all.push(stackImage(list))

    //柱状图
    const datasets = [{
        label: '玩家数',
        data,
        backgroundColor,
    }]

    all.push(await drawLinegraphChart({ labels, datasets }))

    return stackImage(all)
}
