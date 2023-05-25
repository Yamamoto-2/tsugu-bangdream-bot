import { drawCardDetail } from '../view/cardDetail'
import { Context, Schema, h, Session } from 'koishi'
import { isInteger } from './utils'
import {fuzzySearch} from './fuzzySearch'

export async function commandCard(argv: any, text: string) {
    console.log(`text: ${text}`)
    if(!text){
        return '错误: 请输入关键词或卡片ID'
    }
    console.log(argv)
    if (isInteger(text)) {
        var cardDetailbuffer = await drawCardDetail(parseInt(text))
        return [h.image(cardDetailbuffer, 'image/png')]
    }
    var fuzzySearchResult = fuzzySearch([text])
    console.log(fuzzySearchResult)
    if(Object.keys(fuzzySearchResult).length == 0){
        return '错误: 没有有效的关键词'
    }
    
}