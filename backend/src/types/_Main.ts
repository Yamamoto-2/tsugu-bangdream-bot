import { BestdoriapiPath, Bestdoriurl, configPath } from '@/config'
import { callAPIAndCacheResponse } from '@/api/getApi'
import { readJSON } from '@/types/utils'
import { readExcelFile } from '@/types/utils'
import * as path from 'path'

const mainAPI: object = {}//main对象,用于存放所有api数据,数据来源于Bestdori网站

//加载mainAPI
async function loadMainAPI(useCache: boolean = false) {
    const promiseAll = Object.keys(BestdoriapiPath).map(async (key) => {
        const maxRetry = 3
        if (useCache) {
            return mainAPI[key] = await callAPIAndCacheResponse(Bestdoriurl + BestdoriapiPath[key], 1 / 0);
        } else {
            for (let i = 0; i < maxRetry; i++) {
                try {
                    return mainAPI[key] = await callAPIAndCacheResponse(Bestdoriurl + BestdoriapiPath[key]);
                } catch (e) {
                    console.log(`Load ${key} failed, retry (${i + 1}/${maxRetry})`)
                    //等待3秒后重试
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }
    });

    await Promise.all(promiseAll);

    const cardsCNfix = await readJSON(path.join(configPath, 'cardsCNfix.json'))
    for (var key in cardsCNfix) {
        mainAPI['cards'][key] = cardsCNfix[key]
    }
    const skillCNfix = await readJSON(path.join(configPath, 'skillsCNfix.json'))
    for (var key in skillCNfix) {
        mainAPI['skills'][key] = skillCNfix[key]
    }
    const areaItemFix = await readJSON(path.join(configPath, 'areaItemFix.json'))
    for (var key in areaItemFix) {
        if (mainAPI['areaItems'][key] == undefined) {
            mainAPI['areaItems'][key] = areaItemFix[key]
        }
    }
    const songNickname = await readExcelFile(path.join(configPath, 'nickname_song.xlsx'))
    for (let i = 0; i < songNickname.length; i++) {
        const element = songNickname[i];
        if (mainAPI['songs'][element['Id'].toString()]) {
            mainAPI['songs'][element['Id'].toString()]['nickname'] = element['Nickname']
        }
    }

}

console.log("正在初始化")
loadMainAPI(true).then(() => {
    console.log("初始化完成")
    loadMainAPI()
})



setInterval(loadMainAPI, 1000 * 60 * 5)//5分钟更新一次

export default mainAPI