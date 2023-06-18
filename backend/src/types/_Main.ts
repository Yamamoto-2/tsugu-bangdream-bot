import { BestdoriapiPath, Bestdoriurl,configPath } from '../config'
import { callAPIAndCacheResponse } from '../api/getApi'
import {readJSON} from '../utils'
import * as path from 'path'

const mainAPI: object = {}//main对象,用于存放所有api数据,数据来源于Bestdori网站

//加载mainAPI
async function loadMainAPI(useCache: boolean = false) {
    const promiseAll = []
    for (const key in BestdoriapiPath) {
        if(useCache){
            promiseAll.push(mainAPI[key] = await callAPIAndCacheResponse(Bestdoriurl + BestdoriapiPath[key],1/0))
        }
        else{
            promiseAll.push(mainAPI[key] = await callAPIAndCacheResponse(Bestdoriurl + BestdoriapiPath[key]))
        }
    }
    await Promise.all(promiseAll)
    
    var cardsCNfix = await readJSON(path.join(configPath,'cardsCNfix.json'))
    for(var key in cardsCNfix){
        mainAPI['cards'][key] = cardsCNfix[key]
    }
    var skillCNfix = await readJSON(path.join(configPath,'skillsCNfix.json'))
    for(var key in skillCNfix){
        mainAPI['skills'][key] = skillCNfix[key]
    }
    var areaItemFix = await readJSON(path.join(configPath,'areaItemFix.json'))
    for(var key in areaItemFix){
        if(mainAPI['areaItems'][key] == undefined){
            mainAPI['areaItems'][key] = areaItemFix[key]
        }
    }
    
}

console.log("正在初始化")
loadMainAPI().then(() => {
    console.log("初始化完成")
})


setInterval(loadMainAPI, 1000 * 60 * 5)//5分钟更新一次

export default mainAPI