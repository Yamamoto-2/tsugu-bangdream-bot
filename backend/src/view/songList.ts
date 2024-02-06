import { Song } from "@/types/Song";
import mainAPI from "@/types/_Main"
import { match, checkRelationList } from "@/routers/fuzzySearch"
import { Canvas } from 'canvas'
import { drawTitle } from '@/components/title';
import { outputFinalBuffer } from '@/image/output'
import { drawDatablockHorizontal } from "@/components/dataBlock";
import { drawSongInList } from '@/components/list/song';
import { drawDottedLine } from '@/image/dottedLine';
import { stackImage } from '@/components/utils';
import { Server } from '@/types/Server';
import { globalDefaultServer } from '@/config';
import { drawSongDetail } from "./songDetail";

const maxHeight = 6000

// 紧凑化虚线分割
const line = drawDottedLine({
    width: 800,
    height: 10,
    startX: 5,
    startY: 5,
    endX: 795,
    endY: 5,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

//表格用默认竖向虚线
const line2: Canvas = drawDottedLine({
    width: 30,
    height: 6000,
    startX: 10,
    startY: 0,
    endX: 15,
    endY: 5990,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})


export async function drawSongList(matches: { [key: string]: string[] }, defaultServerList: Server[] = globalDefaultServer, compress: boolean): Promise<Array<Buffer | string>> {
    // 计算歌曲模糊搜索结果
    var tempSongList: Array<Song> = [];
    var songIdList: Array<number> = Object.keys(mainAPI['songs']).map(Number)
    for (let i = 0; i < songIdList.length; i++) {
        const tempSong = new Song(songIdList[i]);
        var isMatch = match(matches, tempSong, []);
        //如果在所有所选服务器列表中都不存在，则不输出
        var numberOfNotReleasedServer = 0;
        for (var j = 0; j < defaultServerList.length; j++) {
            var server = defaultServerList[j];
            if (tempSong.publishedAt[server] == null) {
                numberOfNotReleasedServer++;
            }
        }
        if (numberOfNotReleasedServer == defaultServerList.length) {
            isMatch = false;
        }

        //如果有数字关系词，则判断关系词
        if (matches._relationStr != undefined) {
            //如果之后范围的话则直接判断
            if (isMatch || Object.keys(matches).length == 1) {
                isMatch = checkRelationList(tempSong.songId, matches._relationStr)
            }
        }

        if (isMatch) {
            tempSongList.push(tempSong);
        }
    }
    if (tempSongList.length == 0) {
        return ['没有搜索到符合条件的歌曲']
    }
    if (tempSongList.length == 1) {
        return await drawSongDetail(tempSongList[0], defaultServerList,compress)
    }


    var tempSongImageList: Canvas[] = [];
    var songImageListHorizontal: Canvas[] = [];
    var tempH = 0;
    var songPromises: Promise<Canvas>[] = [];

    for (let i = 0; i < tempSongList.length; i++) {
        songPromises.push(drawSongInList(tempSongList[i], undefined, undefined, defaultServerList));
    }

    var songImages = await Promise.all(songPromises);

    for (let i = 0; i < songImages.length; i++) {
        var tempImage = songImages[i];
        tempH += tempImage.height
        if (tempH > maxHeight) {
            tempSongImageList.pop()
            songImageListHorizontal.push(stackImage(tempSongImageList))
            songImageListHorizontal.push(line2)
            tempSongImageList = []
            tempH = tempImage.height
        }
        tempSongImageList.push(tempImage)
        tempSongImageList.push(line)
        if (i == tempSongList.length - 1) {
            tempSongImageList.pop()
            songImageListHorizontal.push(stackImage(tempSongImageList))
            songImageListHorizontal.push(line2)
        }
    }

    songImageListHorizontal.pop();


    var songListImage = drawDatablockHorizontal({
        list: songImageListHorizontal
    })

    var all = []
    all.push(drawTitle('查询', '歌曲列表'))
    all.push(songListImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress:compress
    })
    return [buffer]
}