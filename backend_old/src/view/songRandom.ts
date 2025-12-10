
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title';
import { outputFinalBuffer } from '@/image/output';
import { Song } from '@/types/Song';
import { drawSongDataBlock } from '@/components/dataBlock/song';
import { globalDefaultServer } from '@/config';
import { matchSongList } from '@/view/songList';
import { FuzzySearchResult } from "@/fuzzySearch";

export async function drawSongRandom(matches: FuzzySearchResult, displayedServerList: Server[] = globalDefaultServer, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {

    // 计算歌曲模糊搜索结果
    var tempSongList: Array<Song> = matchSongList(matches, displayedServerList)

    if (tempSongList.length == 0) {
        return ['没有搜索到符合条件的歌曲']
    }

    //在搜索结果中随机选择一首歌曲
    const randomIndex = getRandomInt(tempSongList.length - 1)
    const song = tempSongList[randomIndex]

    var all = []
    all.push(drawTitle('查询', '随机歌曲'))

    //顶部歌曲信息框
    var songDataBlockImage = await drawSongDataBlock(song)
    all.push(songDataBlockImage)

    const songJacket = await song.getSongJacketImage()

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: useEasyBG,
        BGimage: songJacket,
        text: 'Random Song',
        compress: compress,
    })
    return [buffer]
}

//输入max数字，返回一个0-max的随机整数
function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}