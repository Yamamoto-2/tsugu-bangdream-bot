import { drawCharacterList } from '../view/characterList'
import { drawCharacterDetail } from '../view/characterDetail'
import { Context, Schema, h, Session } from 'koishi'
import { isInteger } from './utils'
import { fuzzySearch } from './fuzzySearch'

export async function commandCharacter(session: Session<'tsugu', never>, text: string) {
    const default_servers = session.user.tsugu.default_server
    if (!text) {
        return '错误: 请输入关键词或角色ID'
    }
    if (isInteger(text)) {
        return await drawCharacterDetail(parseInt(text), default_servers)
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return '错误: 没有有效的关键词'
    }
    return await drawCharacterList(fuzzySearchResult, default_servers, session)

}