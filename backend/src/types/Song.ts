import { callAPIAndCacheResponse } from '@/api/getApi'
import { Image, loadImage } from 'skia-canvas'
import { downloadFile } from '@/api/downloadFile'
import { getServerByPriority, Server } from '@/types/Server'
import mainAPI from '@/types/_Main'
import { Bestdoriurl } from '@/config'
import { stringToNumberArray } from '@/types/utils'
import { assetErrorImageBuffer } from "@/image/utils";

export const difficultyName = {//难度名称
    0: "easy",
    1: "normal",
    2: "hard",
    3: "expert",
    4: "special"
}

export const tagNameList = {
    'normal': '原创曲',
    'anime': '翻唱曲',
    'tie_up': 'EXTRA歌曲',
}

export const difficultyColorList = [ //画难度时使用的配色
    "#8eb4fd",
    "#a6f692",
    "#fbdf8c",
    "#ff898b",
    "#f383cb"
]
export const difficultyNameList = [ //难度名称List
    'easy',
    'normal',
    'hard',
    'expert',
    'special'
]

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
        [difficultyId: number]: {
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
        [difficultyId: number]: number
    };
    bpm: {
        [difficultyId: number]: Array<{
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
        lyricist: string[],
        composer: string[],
        arranger: string[],
    }
    howToGet: Array<string | null>
    //用于模糊搜索
    songLevels: number[] = []
    nickname: string | null = null;

    //meta数据
    hasMeta = false;

    meta: {
        [difficultyId: number]: {
            [skillDuration: number]: [
                withoutFeverWithoutSkill: number,
                withoutFeverWithSkill: number,
                withFeverWithoutSkill: number,
                withFeverWithSkill: number
            ]
        }
    }

    isInitfull = false

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
        const metaData = mainAPI['meta'][songId.toString()]
        if (metaData == undefined) {
            return
        }
        this.hasMeta = true
        this.meta = metaData

    }
    async initFull() {
        if (this.isInitfull) {
            return
        }
        if (this.isExist == false) {
            return
        }
        const songData = await this.getData()

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
    async getData() {
        const songData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/songs/${this.songId}.json`)
        return songData
    }
    getSongRip(): number {
        return Math.ceil(this.songId / 10) * 10
    }
    async getSongJacketImage(displayedServerList: Server[] = [Server.jp, Server.cn]): Promise<Image> {
        const jacketImageUrl = this.getSongJacketImageURL(displayedServerList)
        var jacketImageBuffer = await downloadFile(jacketImageUrl)
        //下载失败自动尝试切换服务器下载
        if (jacketImageBuffer.equals(assetErrorImageBuffer)) {
            console.log("download failed, try to download jacket from other servers")
          const servers = ['jp', 'cn', 'en', 'tw', 'kr'];
          var jacketImageName = this.jacketImage[this.jacketImage.length - 1];
          for (const server of servers) {
            const retryUrl = `${Bestdoriurl}/assets/${server}/musicjacket/musicjacket${this.getSongRip()}_rip/assets-star-forassetbundle-startapp-musicjacket-musicjacket${this.getSongRip()}-${jacketImageName}-jacket.png`;
            jacketImageBuffer = await downloadFile(retryUrl, true, false, 1);
            if (!jacketImageBuffer.equals(assetErrorImageBuffer)) break;
          }
        }
        return await loadImage(jacketImageBuffer)
    }
    getSongJacketImageURL(displayedServerList?: Server[]): string {
        var server = getServerByPriority(this.publishedAt, displayedServerList)
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
    async getSongChart(difficultyId: number): Promise<Object> {
        const songChart = await callAPIAndCacheResponse(`${Bestdoriurl}/api/charts/${this.songId}/${difficultyName[difficultyId]}.json`)
        return songChart
    }

    /*
    第一个键是歌曲ID，第二个键是难度ID，第三个键是技能时长
    取到的数组是[ 非fever非技能占比, 非fever技能占比, fever非技能占比, fever技能占比 ]
    天下EX，7秒技能的话就取meta[125][3][7]
    返回[ 1.7464, 2.1164, 2.0527, 2.789 ]
    协力带fever，只看2.0527, 2.789
    如果技能是115%的话总百分比为2.0527 + 215% * 2.789

    上面那个算出来之后，最后再乘准确度加成1.1 * P% + 0.8 * (1 - P%)
    得到的就和站上meta的数字一样了
    然后乘上队伍综合力就行
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

//获取时间范围内指定服务器推出的新歌
export function getPresentSongList(mainServer: Server, start: number = Date.now(), end: number = Date.now()): Song[] {
    var songList: Array<Song> = []
    var songListMain = mainAPI['songs']

    for (const songId in songListMain) {
        if (Object.prototype.hasOwnProperty.call(songListMain, songId)) {
            const song = new Song(parseInt(songId))
            // 检查活动的发布时间和结束时间是否在指定范围内
            if (song.publishedAt[mainServer] == null) {
                continue
            }
            if (song.publishedAt[mainServer] <= end && song.publishedAt[mainServer] >= start) {
                songList.push(song)
            }
            for (let i in song.difficulty) {
                if (song.difficulty[i].publishedAt != undefined) {
                    if (song.difficulty[i].publishedAt[mainServer] <= end && song.difficulty[i].publishedAt[mainServer] >= start) {
                        songList.push(song)
                    }
                }
            }
        }
    }

    return songList
}
export interface songInRank {
    songId: number,
    difficulty: number,
    meta: number,
    rank: number
}
export function getMetaRanking(Fever: boolean, mainServer: Server): songInRank[] {
    var songIdList = Object.keys(mainAPI['meta'])
    var songRankList: songInRank[] = []
    for (let i = 0; i < songIdList.length; i++) {
        const songId = songIdList[i];
        var song = new Song(parseInt(songId))
        //如果在所选服务器都没有发布，则跳过
        if (song.publishedAt[mainServer] == null) {
            continue
        }
        //如果没有meta数据，则跳过
        if (song.hasMeta == false) {
            continue
        }
        //有一些song没有4 difficulty
        for (var j in song.difficulty) {
            var difficulty = parseInt(j)
            var meta = song.calcMeta(Fever, difficulty)
            songRankList.push({
                songId: song.songId,
                difficulty: difficulty,
                meta: meta,
                rank: 0
            })
        }
    }
    songRankList.sort((a, b) => {
        return b.meta - a.meta
    })
    for (let i = 0; i < songRankList.length; i++) {
        songRankList[i].rank = i
    }
    return songRankList
}
