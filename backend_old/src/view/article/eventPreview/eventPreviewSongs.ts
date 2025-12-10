import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { Song, getPresentSongList } from '@/types/Song'
import { drawSongDataBlock } from '@/components/dataBlock/song';
import { drawSongMetaListDataBlock } from '@/components/dataBlock/songMetaList'
import { Band } from '@/types/Band';
import { globalDefaultServer } from '@/config';
import { formatSeconds } from '@/components/list/time'
import { Event } from '@/types/Event';
import { drawArticleTitle1 } from '@/components/article/title'

export async function drawEventPreviewSongs(eventId: number): Promise<Array<Buffer | string>> {
    const event = new Event(eventId)
    if (!event.isExist) {
        return ['错误: 活动不存在']
    }
    const mainServer = Server.jp
    await event.initFull()
    const result = []

    const title = await drawArticleTitle1('活动歌曲', 'Songs', event, true)
    result.push(await title.toBuffer('png'))
    const eventBGImage = await event.getEventBGImage()

    //歌曲列表
    const songList: Song[] = getPresentSongList(mainServer, event.startAt[mainServer], event.endAt[mainServer] + 1000 * 60 * 60)
    const promises = []
    for (let i = 0; i < songList.length; i++) {
        const song = songList[i]
        //跳过国服已经发布的歌曲
        if (song.publishedAt[Server.cn] != null) {
            continue
        }
        promises.push(drawEventSongDetail(song, [Server.jp, Server.tw, Server.cn], eventBGImage))
    }
    const songImages = await Promise.all(promises)

    result.push(...songImages)
    return result
}

async function drawEventSongDetail(song: Song, displayedServerList: Server[] = globalDefaultServer, eventBGImage?: Image): Promise<Buffer | string> {
    if (song.isExist == false) {
        return '错误: 歌曲不存在'
    }
    await song.initFull()
    var list: Array<Image | Canvas> = []
    //标题
    list.push(await drawListByServerList(song.musicTitle, '歌曲名称'))
    list.push(line)

    //歌曲tag(类型)
    var typeImage = drawList({
        key: '类型', text: song.getTagName()
    })
    //歌曲ID
    var IdImage = drawList({
        key: 'ID', text: song.songId.toString()
    })
    list.push(drawListMerge([typeImage, IdImage]))
    list.push(line)

    //乐队
    var band = new Band(song.bandId)
    list.push(await drawListByServerList(band.bandName, '乐队', displayedServerList))
    list.push(line)

    //作词
    list.push(await drawListByServerList(song.detail.lyricist, '作词', displayedServerList))
    list.push(line)
    //作曲
    list.push(await drawListByServerList(song.detail.composer, '作曲', displayedServerList))
    list.push(line)
    //编曲
    list.push(await drawListByServerList(song.detail.arranger, '编曲', displayedServerList))
    list.push(line)
    //时长
    list.push(drawList({
        key: '时长',
        text: formatSeconds(song.length)
    }))
    list.push(line)
    //bpm
    var bpmList: number[] = []
    for (let difficulty in song.bpm) {
        for (let bpmId = 0; bpmId < song.bpm[difficulty].length; bpmId++) {
            const element = song.bpm[difficulty][bpmId];
            bpmList.push(element.bpm)
        }
    }
    var bpm = ''
    var bpmMax = Math.max(...bpmList)
    var bpmMin = Math.min(...bpmList)
    if (bpmMax == bpmMin) {
        bpm = bpmMax.toString()
    }
    else {
        bpm = `${bpmMin} ~ ${bpmMax}`
    }
    list.push(drawList({
        key: 'bpm',
        text: bpm
    }))

    //创建最终输出数组
    var listImage = drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '歌曲'))

    //顶部歌曲信息框
    var songDataBlockImage = await drawSongDataBlock(song)
    all.push(songDataBlockImage)

    all.push(listImage)

    //歌曲meta数据
    var ferverStatusList = [true, false]
    for (let j = 0; j < ferverStatusList.length; j++) {
        const feverStatus = ferverStatusList[j];
        var songMetaListDataBlockImage = await drawSongMetaListDataBlock(feverStatus, song, `${feverStatus ? 'Fever' : '无Fever'}`, [Server.jp])
        all.push(songMetaListDataBlockImage)
    }

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: false,
        BGimage: eventBGImage,
        text: 'Songs'
    })
    return buffer
}