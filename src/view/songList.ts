import { h, Element, Context } from 'koishi'
import { Song } from "../types/Song";
import mainAPI from "../types/_Main"
import { match } from "../commands/fuzzySearch"
import { Canvas, createCanvas, Image, loadImage } from "canvas"
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'
import { drawDatablock, drawDatablockHorizontal } from "../components/dataBlock";
import { drawSongInList } from '../components/list/song';
import { drawDottedLine } from '../image/dottedLine';
import { stackImage } from '../components/utils';

const maxHeight = 7000

// 紧凑化虚线分割
const line2 = drawDottedLine({
    width: 800,
    height: 10,
    startX: 5,
    startY: 15,
    endX: 795,
    endY: 15,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

export async function drawSongList(matches: { [key: string]: string[] }) {
    // 计算歌曲模糊搜索结果
    var tempSongList: Array<Song> = [];
    var songIdList: Array<number> = Object.keys(mainAPI['songs']).map(Number)
    for (let i = 0; i < songIdList.length; i++) {
        const tempSong = new Song(songIdList[i]);
        var isMatch = match(matches, tempSong, []);
        if (isMatch) {
            tempSongList.push(tempSong);
        }
    }
    if (tempSongList.length == 0) {
        return '没有搜索到符合条件的歌曲'
    }


    var tempSongImageList: Canvas[] = []
    var songImageListHorizontal: Canvas[] = []
    var tempH = 0;
    for (let i = 0; i < tempSongList.length; i++) {
        var tempImage = await drawSongInList(tempSongList[i])
        tempH += tempImage.height
        if (tempH > maxHeight) {
            tempSongImageList.pop()
            songImageListHorizontal.push(stackImage(tempSongImageList))
            songImageListHorizontal.push(line2)
            tempSongImageList = []
            tempH = tempImage.height
        }
        tempSongImageList.push(tempImage)
        tempSongImageList.push(line2)
        if (i == tempSongList.length - 1) {
            tempSongImageList.pop()
            songImageListHorizontal.push(stackImage(tempSongImageList))
            songImageListHorizontal.push(line2)
        }
    }
    songImageListHorizontal.pop()

    var songListImage = await drawDatablockHorizontal({
        list: songImageListHorizontal
    })

    var all = []
    all.push(drawTitle('查询', '歌曲列表'))
    all.push(songListImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })
    return h.image(buffer, 'image/png')
}