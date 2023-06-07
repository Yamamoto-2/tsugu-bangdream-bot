import { isInteger } from './utils'
import { fuzzySearch } from './fuzzySearch'
import { drawEventDetail } from '../view/eventDetail'
import { drawEventList } from '../view/eventList'
import { Session } from 'koishi'

export async function commandEvent(session: Session<'tsugu', never>, text: string) {
    const default_servers = session.user.tsugu.default_server
    if (!text) {
        return '错误: 请输入关键词或活动ID'
    }
    if (isInteger(text)) {
        return await drawEventDetail(parseInt(text), default_servers)
    }

    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return '错误: 没有有效的关键词'
    }
    return await drawEventList(fuzzySearchResult, default_servers)

}