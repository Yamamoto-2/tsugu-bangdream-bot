import { Song, difficultyName } from '@/types/Song'
import { Band } from '@/types/Band'
import * as BestdoriPreview from '@/components/BestdoriPreview.cjs'
import { getServerByPriority } from '@/types/Server'
import { Server } from '@/types/Server'
import { globalDefaultServer, serverNameFullList } from '@/config';

export async function drawSongChart(songId: number, difficultyId: number, displayedServerList: Server[] = globalDefaultServer, compress: boolean): Promise<Array<Buffer | string>> {
    const song = new Song(songId)
    if (!song.isExist) {
        return ['歌曲不存在']
    }
    await song.initFull()
    if (!song.difficulty[difficultyId]) {
        return ['难度不存在']
    }
    const server = getServerByPriority(song.publishedAt, displayedServerList)
    const band = new Band(song.bandId)
    const bandName = band.bandName[server]
    const songChart = await song.getSongChart(difficultyId)

    const tempcanv = await BestdoriPreview.DrawPreview({
        id: song.songId,
        title: song.musicTitle[server],
        artist: bandName,
        author: song.detail.lyricist[server],
        level: song.difficulty[difficultyId].playLevel,
        diff: difficultyName[difficultyId],
        cover: song.getSongJacketImageURL(displayedServerList)
    }, songChart as any)
    
    let buffer:Buffer
    if( compress!=undefined && compress){
        buffer = await tempcanv.toBuffer('jpeg',{quality:0.7})
    }
    else{
        buffer = await tempcanv.toBuffer('png')
    }

    return [buffer]
}
