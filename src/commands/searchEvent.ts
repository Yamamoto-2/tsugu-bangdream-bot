import { isInteger } from './utils'
import { fuzzySearch } from './fuzzySearch'
import {drawEventDetail} from '../view/eventdetail'

export async function commandEvent(argv: any, text: string) {
    console.log(`text: ${text}`)
    if (!text) {
        return '错误: 请输入关键词或活动ID'
    }
    console.log(argv)
    if (isInteger(text)) {
        return await drawEventDetail(parseInt(text))
    }
    /*
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return '错误: 没有有效的关键词'
    }
    return await drawEventList(fuzzySearchResult)
     */
}