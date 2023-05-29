import { h, Element } from 'koishi'
import { Event, getPresentEvent } from '../types/Event';
import { Card } from '../types/Card'
import { drawList, line, drawListByServerList, drawTips, drawListMerge } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { drawGachaDatablock } from '../components/dataBlock/gacha'
import { Image, Canvas, createCanvas } from 'canvas'
import { drawBannerImageCanvas } from '../components/dataBlock/utils'
import { drawTimeInList } from '../components/list/time';
import { drawAttributeInList } from '../components/list/attribute'
import { drawCharacterInList } from '../components/list/character'
import { statConfig } from '../components/list/cardStat'
import { drawCardListInList } from '../components/list/cardIconList'
import { getPresentGachaList, Gacha } from '../types/Gacha'
import { Server, defaultserverList } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { drawDegreeListOfEvent } from '../components/list/degreeList';
import { Song, getPresentSongList } from '../types/Song'
import { drawSongListDataBlock } from '../components/dataBlock/songList';
import { drawSongDataBlock } from '../components/dataBlock/song';
import { Band } from '../types/Band';
import { drawEventDatablock } from '../components/dataBlock/event';

export async function drawSongDetail(song: Song): Promise<Element | string> {
    if (song.isExist == false) {
        return '错误: 歌曲不存在'
    }
    await song.initFull()
    var list: Array<Image | Canvas> = []
    //标题
    list.push(await drawListByServerList({
        key: '歌曲名称',
        content: song.musicTitle
    }))
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
    list.push(await drawListByServerList({
        key: '乐队',
        content: band.bandName
    }))
    list.push(line)

    //作词
    list.push(await drawListByServerList({
        key: '作词',
        content: song.detail.lyricist
    }))
    list.push(line)
    //作曲
    list.push(await drawListByServerList({
        key: '作曲',
        content: song.detail.composer
    }))
    list.push(line)
    //编曲
    list.push(await drawListByServerList({
        key: '编曲',
        content: song.detail.arranger
    }))
    list.push(line)
    //时长
    list.push(await drawList({
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
    list.push(await drawList({
        key: 'bpm',
        text: bpm
    }))
    list.push(line)

    //发布时间
    list.push(await drawTimeInList({
        key: '发布时间',
        content: song.publishedAt
    }))
    list.push(line)

    //special难度发布时间
    if(song.difficulty['4']?.publishedAt != undefined ){
        list.push(await drawTimeInList({
            key: 'special难度发布时间',
            content: song.difficulty['4'].publishedAt
        }))
    }

    //创建最终输出数组
    var listImage = await drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '歌曲'))

    //顶部歌曲信息框
    var songDataBlockImage = await drawSongDataBlock(song)
    all.push(songDataBlockImage)

    all.push(listImage)
    //相关活动
    var eventIdList = []//防止重复
    for(var i = 0; i < defaultserverList.length; i++){
        var server = defaultserverList[i]
        var event = getPresentEvent(server,server.getContentByServer(song.publishedAt))
        if(event != undefined && eventIdList.indexOf(event.eventId) == -1){
            eventIdList.push(event.eventId)
            var eventDatablockImage = await drawEventDatablock(event,`${server.serverNameFull}相关活动`)
            all.push(eventDatablockImage)
        }
    }




    

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })
    return h.image(buffer, 'image/png')
}

//时间长度转时分秒函数
function formatSeconds(value: number) {
    var theTime = value;// 秒
    var theTime1 = 0;// 分
    var theTime2 = 0;// 小时
    if (theTime > 60) {
        theTime1 = parseInt((theTime / 60).toString());
        theTime = parseInt((theTime % 60).toString());
        if (theTime1 > 60) {
            theTime2 = parseInt((theTime1 / 60).toString());
            theTime1 = parseInt((theTime1 % 60).toString());
        }
    }
    var result = "" + parseInt(theTime.toString()) + "秒";
    if (theTime1 > 0) {
        result = "" + parseInt(theTime1.toString()) + "分" + result;
    }
    if (theTime2 > 0) {
        result = "" + parseInt(theTime2.toString()) + "小时" + result;
    }
    return result;
}