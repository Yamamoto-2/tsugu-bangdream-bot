import {BestdoriapiPath, Bestdoriurl} from '../config'
import {callAPIAndCacheResponse} from '../api/getApi'

const mainAPI:object =  {}//main对象,用于存放所有api数据,数据来源于Bestdori网站

//加载mainAPI
async function loadMainAPI (){
    const promiseAll = []
    for (const key in BestdoriapiPath) {
        promiseAll.push(mainAPI[key] = await callAPIAndCacheResponse(Bestdoriurl+BestdoriapiPath[key]))
    }
    await Promise.all(promiseAll)
}

loadMainAPI()

//setInterval(loadMainAPI, 1000 * 60 * 5)//5分钟更新一次

export default mainAPI