import { drawSongList } from "../view/songList"
import { fuzzySearch } from "./fuzzySearch"

export async function commandSong(argv: any, text: string) {
    if (!text) {
        return '错误: 请输入关键词或卡片ID'
    }

    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return '错误: 没有有效的关键词'
    }
    return await drawSongList(fuzzySearchResult)
}