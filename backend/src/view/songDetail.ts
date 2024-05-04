import { getPresentEvent } from '@/types/Event';
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'canvas'
import { drawTimeInList } from '@/components/list/time';
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { Song } from '@/types/Song'
import { drawSongDataBlock } from '@/components/dataBlock/song';
import { Band } from '@/types/Band';
import { drawEventDatablock } from '@/components/dataBlock/event';
import { drawSongMetaListDataBlock } from '@/components/dataBlock/songMetaList'
import { globalDefaultServer, serverNameFullList } from '@/config';
import { formatSeconds } from '@/components/list/time'

export async function drawSongDetail(song: Song, defaultServerList: Server[] = globalDefaultServer, compress: boolean): Promise<Array<Buffer | string>> {
    if (song.isExist == false) {
        return ['错误: 歌曲不存在']
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
    list.push(await drawListByServerList(band.bandName, '乐队', defaultServerList))
    list.push(line)

    //作词
    list.push(await drawListByServerList(song.detail.lyricist, '作词', defaultServerList))
    list.push(line)
    //作曲
    list.push(await drawListByServerList(song.detail.composer, '作曲', defaultServerList))
    list.push(line)
    //编曲
    list.push(await drawListByServerList(song.detail.arranger, '编曲', defaultServerList))
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
    list.push(line)

    //发布时间
    list.push(await drawTimeInList({
        key: '发布时间',
        content: song.publishedAt
    }, defaultServerList))

    //special难度发布时间
    if (song.difficulty['4']?.publishedAt != undefined) {
        list.push(line)
        list.push(await drawTimeInList({
            key: 'special难度发布时间',
            content: song.difficulty['4'].publishedAt
        }, defaultServerList))
    }
    if (song.nickname != null) {
        list.push(line)
        list.push(drawList({
            key: '模糊搜索关键词',
            text: song.nickname
        }))
    }

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
        var songMetaListDataBlockImage = await drawSongMetaListDataBlock(feverStatus, song, `${feverStatus ? 'Fever' : '无Fever'}`, defaultServerList)
        all.push(songMetaListDataBlockImage)
    }

    //相关活动
    var eventIdList = []//防止重复
    for (var i = 0; i < defaultServerList.length; i++) {
        var server = defaultServerList[i]
        if (song.publishedAt[server] == null) {
            continue
        }
        var event = getPresentEvent(server, song.publishedAt[server])
        if (event != undefined && eventIdList.indexOf(event.eventId) == -1) {
            eventIdList.push(event.eventId)
            var eventDatablockImage = await drawEventDatablock(event, defaultServerList, `${serverNameFullList[server]}相关活动`)
            all.push(eventDatablockImage)
        }
    }

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress: compress
    })
    return [buffer]
}

