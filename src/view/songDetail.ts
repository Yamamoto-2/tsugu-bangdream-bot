import { h, Element } from 'koishi'
import { Event } from '../types/Event';
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

export async function drawSongDetail(song: Song): Promise<Element | string> {
    if(song.isExist == false){
        return '错误: 歌曲不存在'
    }
    await song.initFull()
    var list: Array<Image | Canvas> = [] 
    var songDataBlockImage = await drawSongDataBlock(song)
    list.push(songDataBlockImage)
    
    //创建最终输出数组
    var listImage = await drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '歌曲'))
    all.push(listImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })
    return h.image(buffer, 'image/png')
}