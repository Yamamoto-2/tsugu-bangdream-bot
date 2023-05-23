import { drawListByServerList } from '../list'
import { Canvas } from 'canvas'

interface timeInListOptions {
    key?: string;
    content: Array<number | null>
}
export async function drawTimeInList({
    key,
    content
}: timeInListOptions
): Promise<Canvas> {
    var formatedTimeList: Array<string> = []
    for (let i = 0; i < content.length; i++) {
        const element = content[i];
        if (element == null) {
            formatedTimeList.push(null)
            continue
        }
        formatedTimeList.push(changeTimefomant(element))
    }
    var canvas = await drawListByServerList({ key, content: formatedTimeList })
    return canvas
}

export var changeTimefomant = function (timeStamp: number) {//时间戳到年月日 精确到分钟
    var date = new Date(Math.floor(timeStamp / 1000) * 1000)
    var nMinutes: string
    if (date.getMinutes() < 10) {
        nMinutes = "0" + date.getMinutes().toString()
        if (date.getMinutes() == 0) { nMinutes = "00" }
    }
    else {
        nMinutes = date.getMinutes().toString()
    }
    var temp = date.getFullYear().toString() + "年" + (date.getMonth() + 1).toString() + "月" + date.getDate().toString() + "日 " + date.getHours().toString() + ":" + nMinutes
    return temp
}
