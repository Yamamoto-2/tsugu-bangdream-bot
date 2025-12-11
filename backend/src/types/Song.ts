/**
 * Song domain type
 * Migrated from backend_old/src/types/Song.ts
 * Removed: HTTP calls (getData, getSongChart), rendering methods (getSongJacketImage)
 * 
 * Note: Constructor still depends on mainAPI for initial data loading
 * This will be refactored to use BestdoriClient in the future
 */

import { Server, getServerByPriority } from './Server'
import { stringToNumberArray } from './utils'

export const difficultyName = {
    0: "easy",
    1: "normal",
    2: "hard",
    3: "expert",
    4: "special"
}

export const tagNameList: { [key: string]: string } = {
    'normal': '原创曲',
    'anime': '翻唱曲',
    'tie_up': 'EXTRA歌曲',
}

export const difficultyColorList = [
    "#8eb4fd",
    "#a6f692",
    "#fbdf8c",
    "#ff898b",
    "#f383cb"
]

export const difficultyNameList = [
    'easy',
    'normal',
    'hard',
    'expert',
    'special'
]

export interface SongDifficulty {
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

export interface SongBPM {
    bpm: number,
    start: number,
    end: number
}

export interface SongMeta {
    [difficultyId: number]: {
        [skillDuration: number]: [
            number, // withoutFeverWithoutSkill
            number, // withoutFeverWithSkill
            number, // withFeverWithoutSkill
            number  // withFeverWithSkill
        ]
    }
}

export class Song {
    songId: number;
    isExist = false;
    data!: object;
    tag!: string;
    bandId!: number;
    jacketImage!: Array<string>;
    musicTitle!: Array<string | null>;
    publishedAt!: Array<number | null>;
    closedAt!: Array<number | null>;
    difficulty!: {
        [difficultyId: number]: SongDifficulty
    };
    length!: number;
    notes!: {
        [difficultyId: number]: number
    };
    bpm!: {
        [difficultyId: number]: Array<SongBPM>
    }

    //other
    bgmId!: string;
    bgmFile!: string;
    seq!: number;
    achievements!: Array<{
        musicId: number,
        achievementType: string,
        rewardType: string,
        quantity: number,
    }>
    detail!: {
        lyricist: string[],
        composer: string[],
        arranger: string[],
    }
    howToGet!: Array<string | null>
    //用于模糊搜索
    songLevels: number[] = []
    nickname: string | null = null;

    //meta数据
    hasMeta = false;
    meta!: SongMeta

    isInitfull = false

    /**
     * Constructor - creates Song from songId
     * TODO: In the future, songData should be provided via BestdoriClient instead of mainAPI
     */
    constructor(songId: number, songData?: any, metaData?: SongMeta) {
        this.songId = songId
        
        // For backward compatibility, if songData is not provided, we can't initialize
        // In the future, this should always be provided via BestdoriClient
        if (!songData) {
            this.isExist = false;
            return
        }

        this.isExist = true;
        this.data = songData
        this.tag = songData['tag']
        this.bandId = songData['bandId']
        this.jacketImage = songData['jacketImage']
        this.musicTitle = songData['musicTitle']
        this.publishedAt = songData['publishedAt'] ? stringToNumberArray(songData['publishedAt']) : [];
        this.closedAt = songData['closedAt'] ? stringToNumberArray(songData['closedAt']) : [];
        this.difficulty = songData['difficulty']
        this.length = songData['length']
        this.notes = songData['notes']
        this.bpm = songData['bpm']
        this.nickname = songData['nickname']
        
        for (let i in this.difficulty) {
            const playLevel = this.difficulty[i].playLevel;
            this.songLevels.push(playLevel !== undefined ? playLevel : 0);
        }

        //meta数据
        if (metaData) {
            this.hasMeta = true
            this.meta = metaData
        }
    }

    /**
     * Initialize full song data from provided songData
     * This replaces the old initFull() which made HTTP calls
     */
    initFromFullData(songData: any): void {
        if (this.isInitfull) {
            return
        }
        if (this.isExist == false) {
            return
        }

        this.data = songData
        this.tag = songData['tag']
        this.bandId = songData['bandId']
        this.jacketImage = songData['jacketImage']
        this.musicTitle = songData['musicTitle']
        this.publishedAt = songData['publishedAt'] ? stringToNumberArray(songData['publishedAt']) : [];
        this.closedAt = songData['closedAt'] ? stringToNumberArray(songData['closedAt']) : [];
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

        this.isInitfull = true
    }

    /**
     * Calculate song rip number (used for asset bundle naming)
     */
    getSongRip(): number {
        return Math.ceil(this.songId / 10) * 10
    }

    /**
     * Get jacket image URL (pure function, no HTTP calls)
     * TODO: Bestdoriurl should come from config/constants.ts
     */
    getSongJacketImageURL(displayedServerList?: Server[], bestdoriUrl?: string): string {
        const Bestdoriurl = bestdoriUrl || 'https://bestdori.com'
        var server = getServerByPriority(this.publishedAt, displayedServerList) || Server.jp
        var jacketImageName = this.jacketImage[this.jacketImage.length - 1]
        var songRip = this.getSongRip();
        if (this.songId == 13 || this.songId == 40) {
            songRip = 30;
        } else if(this.songId == 273) { //针对273的修复
            server = Server.cn;
        }
        var jacketImageUrl = `${Bestdoriurl}/assets/${Server[server]}/musicjacket/musicjacket${songRip}_rip/assets-star-forassetbundle-startapp-musicjacket-musicjacket${songRip}-${jacketImageName.toLowerCase()}-jacket.png`
        return jacketImageUrl
    }

    getTagName(): string {
        if (this.tag == undefined) {
            return this.tag
        }
        return tagNameList[this.tag]
    }

    /**
     * Calculate meta score parameter
     * Pure calculation function - no IO
     */
    calcMeta(withFever: boolean, difficultyId: number, scoreUpMaxValue: number = 100, skillDuration: number = 7, accruacy: number = 100): number {
        if (this.hasMeta == false) {
            return 0
        }
        if (withFever) {
            var skillParameter = this.meta[difficultyId][skillDuration][2] + (100 + scoreUpMaxValue) / 100 * this.meta[difficultyId][skillDuration][3]
        }
        else {
            var skillParameter = this.meta[difficultyId][skillDuration][0] + (100 + scoreUpMaxValue) / 100 * this.meta[difficultyId][skillDuration][1]
        }
        var scoreParameter = skillParameter * (1.1 * accruacy / 100 + 0.8 * (1 - accruacy / 100))
        return scoreParameter
    }
}

export interface songInRank {
    songId: number,
    difficulty: number,
    meta: number,
    rank: number
}

