import { drawSongInList } from "@/components/list/song"
import { Song, songInRank, getMetaRanking } from "@/types/Song"
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { drawDottedLine } from '@/image/dottedLine'
import { Server } from "@/types/Server"
import { globalDefaultServer, serverNameFullList } from "@/config"

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

export async function drawSongMetaListDataBlock(Fever: boolean, song: Song, topLeftText?: string, displayedServerList: Server[] = globalDefaultServer) {
    var metaRanking = {}
    for (let i = 0; i < displayedServerList.length; i++) {
        const server = displayedServerList[i];
        metaRanking[server] = {}
        metaRanking[server].data = getMetaRanking(Fever, server)
        metaRanking[server].maxMeta = metaRanking[server].data[0].meta
    }
    var list: Array<Image | Canvas> = []

    var songMetaRanking = {}
    for (let i = 0; i < displayedServerList.length; i++) {
        const server = displayedServerList[i];
        songMetaRanking[server] = {}
        let tempMetaRanking = metaRanking[server].data
        //过滤出所有属于这首歌的数据
        songMetaRanking[server].data = tempMetaRanking.filter((value: songInRank) => {
            return value.songId == song.songId
        })
    }
    for (var difficulty in song.difficulty) {
        var difficultyId = parseInt(difficulty)
        var text = ''
        for (let i = 0; i < displayedServerList.length; i++) {
            var tempSongMetaRanking = songMetaRanking[displayedServerList[i]].data
            for (let j = 0; j < tempSongMetaRanking.length; j++) {
                if (tempSongMetaRanking[j].difficulty == difficultyId) {
                    var precent = tempSongMetaRanking[j].meta / metaRanking[displayedServerList[i]].maxMeta * 100
                    precent = Math.round(precent * 100) / 100
                    text += `${serverNameFullList[displayedServerList[i]]}: ${precent}% #${tempSongMetaRanking[j].rank + 1} `
                }
            }
        }
        list.push(await drawSongInList(song, difficultyId, text))
        list.push(line)
    }

    list.pop()
    return (drawDatablock({ list, topLeftText }))
}

export async function drawMetaListDataBlock(Fever: boolean, server: Server, topLeftText?: string) {
    var metaRanking = getMetaRanking(Fever, server)
    var maxMeta = metaRanking[0].meta
    var list: Array<Image | Canvas> = []
    var max = 50
    for (let i = 0; i < max; i++) {
        if (i >= metaRanking.length) {
            break
        }
        var song = new Song(metaRanking[i].songId)
        var difficultyId = metaRanking[i].difficulty
        //保留两位小数
        var precent = metaRanking[i].meta / maxMeta * 100
        list.push(await drawSongInList(song, difficultyId, `相对分数: ${precent.toFixed(2)}% #${metaRanking[i].rank + 1}`))
        list.push(line)
    }
    list.pop()
    return (drawDatablock({ list, topLeftText }))
}
