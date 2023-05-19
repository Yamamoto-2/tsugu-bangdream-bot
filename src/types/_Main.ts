import { BestdoriapiPath, Bestdoriurl } from '../config'
import { callAPIAndCacheResponse } from '../api/getApi'

const mainAPI: object = {}//main对象,用于存放所有api数据,数据来源于Bestdori网站

//加载mainAPI
async function loadMainAPI() {
    const promiseAll = []
    for (const key in BestdoriapiPath) {
        promiseAll.push(mainAPI[key] = await callAPIAndCacheResponse(Bestdoriurl + BestdoriapiPath[key]))
    }
    await Promise.all(promiseAll)

    //对events进行排序，顺序输出到eventsKeys
    const eventKeys: Array<string> = Object.keys(mainAPI['events'])
    eventKeys.sort(function (tempa, tempb) {
        var a = parseInt(tempa)
        var b = parseInt(tempb)
        if (a == 119 && b > 106) {
            return (-1)
        }
        if (a == 138 && b == 137) {
            return (-1)
        }
        if (mainAPI['events'][a]["startAt"][3] != null && mainAPI['events'][b]["startAt"][3] != null) {
            if (mainAPI['events'][a]["startAt"][3] > mainAPI['events'][b]["startAt"][3]) {
                return (1)
            }
            else { return (-1) }
        }
        else {
            if (mainAPI['events'][a]["startAt"][0] > mainAPI['events'][b]["startAt"][0]) {
                return (1)
            }
            else { return (-1) }
        }
    }
    )
    mainAPI['eventsKeys'] = eventKeys
    
}

console.log("正在初始化")
loadMainAPI()
console.log("初始化完成")

//setInterval(loadMainAPI, 1000 * 60 * 5)//5分钟更新一次

export default mainAPI