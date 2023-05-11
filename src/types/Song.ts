import { callAPIAndCacheResponse } from '../api/getApi'
import mainAPI from './_Main'

interface difficulty {
    0: "easy",
    1: "normal",
    2: "hard",
    3: "expert",
    4: "special"
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
            scoreSS?: number
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
}