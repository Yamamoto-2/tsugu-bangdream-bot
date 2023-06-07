import { drawSongList } from "../view/songList"
import { fuzzySearch } from "./fuzzySearch"
import { isInteger } from "./utils"
import { drawSongDetail } from "../view/songDetail"
import { Song } from "../types/Song"
import { Session } from "koishi"

export async function commandSong(session: Session<'tsugu', never>, text: string) {
    if (!text) {
        return '错误: 请输入关键词或卡片ID'
    }
    if (isInteger(text)) {
        return await drawSongDetail(new Song(parseInt(text)))
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return '错误: 没有有效的关键词'
    }
    return await drawSongList(fuzzySearchResult)
}