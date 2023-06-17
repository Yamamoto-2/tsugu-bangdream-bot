import { drawCardDetail } from '../view/cardDetail'
import { drawCardList } from '../view/cardList'
import { isInteger } from './utils'
import { fuzzySearch } from './fuzzySearch'
import { Server } from '../types/Server'

export async function commandCard(default_servers: Server[], text: string, useEasyBG: boolean): Promise<Array<string | Buffer>> {
    if (!text) {
        return ['错误: 请输入关键词或卡片ID']
    }
    if (isInteger(text)) {
        return await drawCardDetail(parseInt(text), default_servers, useEasyBG)
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawCardList(fuzzySearchResult, default_servers)

}