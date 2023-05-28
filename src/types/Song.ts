import { callAPIAndCacheResponse } from '../api/getApi'
import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'
import {getServerByPriority, Server} from './Server'
import mainAPI from './_Main'

interface difficulty {
    0: "easy",
    1: "normal",
    2: "hard",
    3: "expert",
    4: "special"
}

var tagNameList = {
    'normal': '原创曲',
    'anime': '翻唱曲',
    'extra': 'EXTRA歌曲',
}

export class Song {
    songId: number;
    isExist = false;
    data: object;
    tag: string;
    bandId: number;
    jacketImage: Array<string>;
    musicTitle: Array<string | null>;
    publishedAt: Array<number | null>;
    closedAt: Array<number | null>;
    difficulty: {
        [difficulty: number]: {
            playLevel: number,
            multiLiveScoreMap?: object,
            notesQuantity?: number,
            scoreC?: number,
            scoreB?: number,
            scoreA?: number,
            scoreS?: number,
            scoreSS?: number,
            publishedAt?: Array<number | null>,
        }
    };
    length: number;
    notes: {
        [difficulty: number]: number
    };
    bpm: {
        [difficulty: number]: Array<{
            bpm: number,
            start: number,
            end: number
        }>
    }


    //other
    bgmId: string;
    bgmFile: string;
    seq: number;
    achievements: Array<{
        musicId: number,
        achievementType: string,
        rewardType: string,
        quantity: number,
    }>
    detail: {
        lyricist: string,
        composer: string,
        arranger: string,
    }
    howToGet: Array<string | null>
    //用于模糊搜索
    songLevels:string[] = []

    constructor(songId: number) {
        this.songId = songId
        const songData = mainAPI['songs'][songId.toString()]
        if (songData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.data = songData
        this.tag = songData['tag']
        this.bandId = songData['bandId']
        this.jacketImage = songData['jacketImage']
        this.musicTitle = songData['musicTitle']
        this.publishedAt = songData['publishedAt']
        this.closedAt = songData['closedAt']
        this.difficulty = songData['difficulty']
        this.length = songData['length']
        this.notes = songData['notes']
        this.bpm = songData['bpm']
        for(let i in this.difficulty){
            this.songLevels.push(this.difficulty[i].playLevel.toString())
        }
    }
    async initFull() {
        if (this.isExist == false) {
            return
        }
        const songData = await this.getData()
        this.data = songData

        this.tag = songData['tag']
        this.bandId = songData['bandId']
        this.jacketImage = songData['jacketImage']
        this.musicTitle = songData['musicTitle']
        this.publishedAt = songData['publishedAt']
        this.closedAt = songData['closedAt']
        this.difficulty = songData['difficulty']
        this.length = songData['length']
        this.notes = songData['notes']
        this.bpm = songData['bpm']

        //other
        this.bgmId = songData['bgmId']
        this.bgmFile = songData['bgmFile']
        this.achievements = songData['achievements']
        this.seq = songData['seq']
        this.detail = {
            lyricist: songData['lyricist'],
            composer: songData['composer'],
            arranger: songData['arranger'],
        }
        this.howToGet = songData['howToGet']
    }
    async getData() {
        const songData = await callAPIAndCacheResponse(`https://bestdori.com/api/songs/${this.songId}.json`)
        return songData
    }
    getSongRip(): number {
        return Math.ceil(this.songId / 10) * 10
    }
    async getSongJacketImage(): Promise<Image> {
        var server = getServerByPriority(this.publishedAt)
        var jacketImageName = this.jacketImage[this.jacketImage.length - 1]
        var jacketImageBuffer = await downloadFileCache(`https://bestdori.com/assets/${server.serverName}/musicjacket/musicjacket${this.getSongRip()}_rip/assets-star-forassetbundle-startapp-musicjacket-musicjacket${this.getSongRip()}-${jacketImageName.toLowerCase()}-jacket.png`)
        return await loadImage(jacketImageBuffer)
    }
    getTagName(): string {
        if(this.tag == undefined){
            return this.tag
        }
        return tagNameList[this.tag]
    }
}

//获取时间范围内指定服务器推出的新歌
export function getPresentSongList(server: Server, start: number = Date.now(), end: number = Date.now()): Song[] {
    var songList: Array<Song> = []
    var songListMain = mainAPI['songs']
    
    for (const songId in songListMain) {
        if (Object.prototype.hasOwnProperty.call(songListMain, songId)) {
            const song = new Song(parseInt(songId))
            // 检查活动的发布时间和结束时间是否在指定范围内
            if (song.publishedAt[server.serverId] <= end && song.publishedAt[server.serverId] >= start) {
                songList.push(song)
            }
            for(let i in song.difficulty){
                if(song.difficulty[i].publishedAt != undefined){
                    if(song.difficulty[i].publishedAt[server.serverId] <= end && song.difficulty[i].publishedAt[server.serverId] >= start){
                        songList.push(song)
                    }
                }
            }
        }
    }
    
    return songList
}