import { h, Element, Context } from 'koishi'
import { Song } from "../types/Song";
import mainAPI from "../types/_Main"
import { match } from "../commands/fuzzySearch"
import { Canvas, createCanvas, Image, loadImage } from "canvas"
import { stackImage, stackImageHorizontal, resizeImage } from '../components/utils'
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'
import { defaultserverList } from '../types/Server'
import { drawText, drawTextWithImages } from "../components/text";
import { drawListWithLine, line } from "../components/list";
import { drawDatablock } from "../components/dataBlock";
import { drawRoundedRect } from '../image/drawRect';
import { createContext } from 'vm';
import { Band } from '../types/Band';
import { defaultserver } from '../config';


export async function drawSongList(matches: { [key: string]: string[] }) {
    // 计算歌曲模糊搜索结果
    var tempSongList: Array<Song> = [];
    //var songIdList: Array<number> = Object.keys(mainAPI['songs']).map(Number)
    // for (let i = 0; i < songIdList.length; i++) {
    //     const tempSong = new Song(songIdList[i]);
    //     var isMatch = match(matches, tempSong, []);
    //     if (isMatch) {
    //         tempSongList.push(tempSong);
    //     }
    // }
    // if (tempSongList.length == 0) {
    //     return '没有搜索到符合条件的歌曲'
    // }
    tempSongList = [new Song(1), new Song(2), new Song(3)]
    var tempSongImageList: Canvas[] = []
    var tempH = 0;
    for (let i = 0; i < tempSongList.length; i++) {
        var tempImage = await drawSongInList(tempSongList[i])
        tempH += tempImage.height
        tempSongImageList.push(tempImage)
        tempSongImageList.push(line)
    }
    var songListImage = await drawDatablock({
        list: tempSongImageList
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
async function drawSongInList(song: Song): Promise<Canvas> {
    await song.initFull()
    var content = []

    const blockWidth = 800
    const blockHeight = 480
    const songJacketImage = resizeImage({
        image: await song.getSongJacketImage(),
        widthMax: 420,
        heightMax: 420
    })

    var lineCanvas = createCanvas(500, 4)
    var linectx = lineCanvas.getContext('2d')
    linectx.fillStyle = "#a3a3a3"
    linectx.fillRect(0, 2, 500, 2)

    var canvas = createCanvas(blockWidth, blockHeight)
    var ctx = canvas.getContext('2d')

    // 绘制边框
    ctx.drawImage(drawRoundedRect({
        width: 900,
        height: 480,
        strokeWidth: 2
    }), 0, 0)

    // 绘制封面
    ctx.drawImage(songJacketImage, 30, 30)

    // 歌曲名
    ctx.drawImage(drawText({
        text: song.musicTitle[defaultserverList[0].serverId].replace('_', ' '),
        textSize: 24,
        maxWidth: 500
    }), 480, 40)

    ctx.drawImage(lineCanvas, 480, 65)

    // 歌曲id
    content.push(`ID: ${song.songId}\n`)

    // 乐队名
    content.push(`${new Band(song.bandId).bandName[defaultserverList[0].serverId]}\n`)

    // 类型 (翻唱还是原创)
    content.push(`${song.getTagName()}\n`)

    ctx.drawImage(drawTextWithImages({
        content: content,
        textSize: 18,
        maxWidth: 500
    }), 480, 70)

    return canvas
}