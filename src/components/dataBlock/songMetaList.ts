import { drawSongInList } from "../list/song"
import { Song, songInRank, getMetaRanking } from "../../types/Song"
import { drawDatablock } from '../dataBlock'
import { Image, Canvas, createCanvas } from "canvas"
import { drawDottedLine } from '../../image/dottedLine'
import { Server, defaultserverList } from "../../types/Server"

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

export async function drawSongMetaListDataBlock(Fever: boolean, song: Song, topLeftText?: string) {
    var metaRanking = {}
    for (let i = 0; i < defaultserverList.length; i++) {
        const server = defaultserverList[i];
        metaRanking[server.serverId] = {}
        metaRanking[server.serverId].data = getMetaRanking(Fever, server)
        metaRanking[server.serverId].maxMeta = metaRanking[server.serverId].data[0].meta
    }
    var list: Array<Image | Canvas> = []

    var songMetaRanking = {}
    for (let i = 0; i < defaultserverList.length; i++) {
        const server = defaultserverList[i];
        songMetaRanking[server.serverId] = {}
        let tempMetaRanking = metaRanking[server.serverId].data
        //过滤出所有属于这首歌的数据
        songMetaRanking[server.serverId].data = tempMetaRanking.filter((value: songInRank) => {
            return value.songId == song.songId
        })
    }
    for (var difficulty in song.difficulty) {
        var difficultyId = parseInt(difficulty)
        var text = ''
        for (let i = 0; i < defaultserverList.length; i++) {
            var tempSongMetaRanking = songMetaRanking[defaultserverList[i].serverId].data
            for (let j = 0; j < tempSongMetaRanking.length; j++) {
                if (tempSongMetaRanking[j].difficulty == difficultyId) {
                    var precent = tempSongMetaRanking[j].meta / metaRanking[defaultserverList[i].serverId].maxMeta * 100
                    precent = Math.round(precent * 100) / 100
                    text += `${defaultserverList[i].serverNameFull}: ${precent}% #${tempSongMetaRanking[j].rank} `
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
        precent = Math.round(precent * 100) / 100
        list.push(await drawSongInList(song, difficultyId, `相对效率: ${precent}% #${metaRanking[i].rank}`))
        list.push(line)
    }
    list.pop()
    return (drawDatablock({ list, topLeftText }))
}
