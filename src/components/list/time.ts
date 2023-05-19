import { drawListByServerList } from '../list'
import { Canvas } from 'canvas'


async function drawTimeInList(
    key: string,
    timeList: Array<number|null>
): Promise<Canvas> {
    var formatedTimeList: Array<string> = []
    for (let i = 0; i < timeList.length; i++) {
        const element = timeList[i];
        if(element == null) {
            formatedTimeList.push(null)
            continue
        }
        formatedTimeList.push(changeTimefomant(element))
    }
    console.log(formatedTimeList)
    var canvas = await drawListByServerList(key, formatedTimeList)
    return canvas
}

var changeTimefomant = function (timeStamp: number) {//时间戳到年月日 精确到分钟
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

export { drawTimeInList, changeTimefomant }