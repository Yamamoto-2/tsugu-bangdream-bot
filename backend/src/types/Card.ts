import { callAPIAndCacheResponse } from '@/api/getApi'
import { Skill } from '@/types/Skill'
import { Character } from '@/types/Character'
import { Server, getServerByPriority, serverList } from '@/types/Server'
import { Gacha } from '@/types/Gacha'
import { Event } from '@/types/Event'
import { Image, loadImage } from 'skia-canvas'
import { downloadFile } from '@/api/downloadFile'
import { downloadFileCache } from '@/api/downloadFileCache'
import mainAPI from '@/types/_Main'
import { globalDefaultServer } from '@/config'
import { stringToNumberArray, formatNumber } from '@/types/utils'
import { Bestdoriurl } from "@/config"

var cardDataCache = {}

export interface Stat {//综合力
    performance: number,
    technique: number,
    visual: number
}

const typeName = {
    'initial': '初始',
    'permanent': '常驻',
    'limited': '期间限定',
    'birthday': '生日限定',
    'event': '活动',
    'others': '其他',
    'campaign': '联动',
    'dreamfes': '梦幻Fes限定',
    'kirafes': '闪光Fes限定',
}

export function addStat(stat: Stat, add: Stat): void {//综合力相加函数
    stat.performance += add.performance
    stat.technique += add.technique
    stat.visual += add.visual
}

function limitBreakRankStat(rarity: number) {//不同稀有度突破一级增加的属性
    var tempStat: Stat = {
        performance: 50 * rarity,
        technique: 50 * rarity,
        visual: 50 * rarity
    }
    return (tempStat)
}

export class Card {
    cardId: number;
    isExist: boolean = false;

    data: object;
    characterId: number;
    rarity: number;
    type: string; //'initial'|'permanent'|'limited'|'birthday'|'event'|'others'|'dreamfes'|'kirafes';
    attribute: 'cool' | 'happy' | 'pure' | 'powerful'
    levelLimit: number;
    resourceSetName: string;
    sdResourceName: string;
    costumeId: number;
    gachaText: Array<string | null>;
    prefix: Array<string | null>;
    releasedAt: Array<number | null>;
    skillName: Array<string | null>;
    source: Array<{
        [type: string]: {
            [id: string]: object
        }
    } | {}>;
    skillId: number;
    isInitFull: boolean = false;
    stat: object;
    bandId: number;

    //other
    skillType: string;
    scoreUpMaxValue: number;
    releaseGacha: Array<Array<number>>;
    releaseEvent: Array<Array<number>>;

    constructor(cardId: number) {
        this.cardId = cardId
        const cardData = mainAPI['cards'][cardId.toString()]
        if (cardData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.data = cardData
        this.characterId = cardData['characterId']
        this.bandId = new Character(this.characterId).bandId
        this.rarity = cardData['rarity']
        this.type = cardData['type']
        this.attribute = cardData['attribute']
        this.levelLimit = cardData['levelLimit']
        this.resourceSetName = cardData['resourceSetName']
        this.prefix = cardData['prefix']
        this.releasedAt = stringToNumberArray(cardData['releasedAt'])
        this.skillId = cardData['skillId']
        this.stat = cardData['stat']
        var skill = new Skill(this.skillId)
        this.skillType = skill.effectTypes[0]
        this.scoreUpMaxValue = skill.scoreUpMaxValue
    }
    async initFull(useCache: boolean = true) {
        if (this.isInitFull) {
            return
        }
        if (this.isExist == false) {
            return
        }
        this.isExist = true;
        if (cardDataCache[this.cardId.toString()] != undefined && !useCache) {
            var cardData = cardDataCache[this.cardId.toString()]
        }
        else {
            var cardData = await this.getData(useCache)
            cardDataCache[this.cardId.toString()] = cardData
        }
        this.isInitFull = true;
        this.data = cardData
        /*
        this.characterId = cardData['characterId']
        this.rarity = cardData['rarity']
        this.type = cardData['type']
        this.attribute = cardData['attribute']
        this.levelLimit = cardData['levelLimit']
        this.resourceSetName = cardData['resourceSetName']
        this.prefix = cardData['prefix']
        this.releasedAt =  stringToNumberArray(cardData['releasedAt'])
        */
        this.sdResourceName = cardData['sdResourceName']
        this.costumeId = cardData['costumeId']
        this.gachaText = cardData['gachaText']

        this.source = cardData['source']
        //修复国服releaseAt错误问题,将国服的releaseAt改为卡池或活动的开始时间
        var Cnserver = Server.cn
        this.getSource()
        if (this.releaseEvent[Cnserver].length != 0) {
            this.releasedAt[Cnserver] = new Event(this.releaseEvent[Cnserver][0]).startAt[Cnserver]
        }
        else if (this.releaseGacha[Cnserver].length != 0) {
            var earlistGacha = new Gacha(this.releaseGacha[Cnserver][0])
            this.releasedAt[Cnserver] = earlistGacha.publishedAt[Cnserver]
        }

        this.skillName = cardData['skillName']
        this.skillId = cardData['skillId']
        this.stat = cardData['stat']


        //缓存数据
        if (cardDataCache[this.cardId.toString()] == undefined) {
            cardDataCache[this.cardId.toString()] = cardData
        }
        this.isInitFull = true;
    }
    async getData(update: boolean = true) {
        var time = update ? 0 : 1 / 0
        var cardData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/cards/${this.cardId}.json`, time)
        return cardData
    }

    ableToTraining(trainingStatus?: boolean): boolean {//判断是否能够进行特训
        if (this.rarity < 3) {
            return false
        }
        if (this.stat['training']['performance'] == 0 && this.stat['training']['technique'] == 0 && this.stat['training']['visual'] == 0) {//如果没有特训数据，因为有levelLimit，所以只能这么写
            return true
        }
        return trainingStatus ?? true
    }
    getTrainingStatusList(): Array<boolean> {//判断是否能够进行特训
        var trainingStatusList = []
        if (this.rarity < 3) {
            trainingStatusList.push(false)
            return trainingStatusList
        }
        if (this.stat['training']['performance'] == 0 && this.stat['training']['technique'] == 0 && this.stat['training']['visual'] == 0) {//如果没有特训数据，因为有levelLimit，所以只能这么写
            trainingStatusList.push(true)
            return trainingStatusList
        }
        return [false, true]
    }

    //计算综合力函数
    // async calcStat(level?: number, trainingStatus: boolean = false, limitBreakRank: number = 0, episode1: boolean = true, episode2: boolean = true, ) {
    //     if (!this.isInitFull) {
    //         //如果不是默认情况(带有level以外的参数)，加载完整数据，其中包含完整综合力数据
    //         /*
    //         if (trainingStatus != undefined || limitBreakRank != undefined || episode1 != undefined || episode2 != undefined) {
    //             await this.initFull()
    //         }
    //         */
    //         await this.initFull()

    //     }
    //     const stat: Stat = {
    //         performance: 0,
    //         technique: 0,
    //         visual: 0
    //     }

    //     var maxLevel = this.getMaxLevel()
    //     level ??= maxLevel//如果没有等级参数，则默认为最大等级
    //     if (level > maxLevel) {//等级超过上限,按上限计算
    //         level = maxLevel
    //     }
    //     if (this.ableToTraining()) {//如果能够进行特训
    //         if (level > this.levelLimit) {//如果等级超过需要特训等级，则默认已经特训
    //             trainingStatus = true
    //         }
    //     }

    //     addStat(stat, this.stat[level.toString()])//加上等级对应的属性

    //     if (trainingStatus) {//如果已经特训
    //         addStat(stat, this.stat['training'])
    //     }
    //     if (this.stat['episodes'] != undefined) {//如果有剧情
    //         if (episode1) {//如果已经阅读剧情1
    //             addStat(stat, this.stat['episodes'][0])
    //         }
    //         if (episode2) {//如果已经阅读剧情2
    //             addStat(stat, this.stat['episodes'][1])
    //         }
    //     }

    //     if (limitBreakRank > 0) {
    //         for (var i = 1; i <= limitBreakRank; i++) {
    //             addStat(stat, limitBreakRankStat(this.rarity))
    //         }
    //     }
    //     return stat
    // }
    async calcStat(cardData?) {
        if (!this.isInitFull) {
            await this.initFull()
        }
        const level = cardData ? cardData.level : this.getMaxLevel()
        const stat = this.stat[level.toString()]
        if (cardData) {
            // console.log(cardData)
            if (cardData.userAppendParameter) {
                const userAppend = cardData.userAppendParameter
                const appendStat: Stat = {
                    performance: userAppend.performance + (userAppend.characterPotentialPerformance || 0) + (userAppend.characterBonusPerformance || 0),
                    technique: userAppend.technique + (userAppend.characterPotentialTechnique || 0) + (userAppend.characterBonusTechnique || 0),
                    visual: userAppend.visual + (userAppend.characterPotentialVisual || 0) + (userAppend.characterBonusVisual || 0)
                }
                addStat(stat, appendStat)
            }
            return stat
        }
        if(this.stat['training'] != undefined){//如果可以特训
            addStat(stat, this.stat['training'])
        }
        if (this.stat['episodes'] != undefined) {//如果有剧情
            addStat(stat, this.stat['episodes'][0])
            addStat(stat, this.stat['episodes'][1])
        }

        return stat
    }
    getSkill(): Skill {
        return new Skill(this.skillId)
    }
    isReleased(server: Server): boolean {//确定是否在该服务器发布
        if (this.releasedAt[server] == null) {
            return false
        }
        return true
    }
    getFirstReleasedServer(displayedServerList: Server[] = globalDefaultServer): Server {//获得确保已经发布了的服务器
        if (!displayedServerList) displayedServerList = globalDefaultServer
        return getServerByPriority(this.releasedAt, displayedServerList)
    }
    getRip(): string {
        if (this.cardId < 9999) {//确定目录位置，50为一组
            var cardRessetIdNumber: number = Math.floor(this.cardId / 50)
            var cardRessetId: string = cardRessetIdNumber.toString()
            cardRessetId = formatNumber(cardRessetIdNumber, 3)
        }
        else {
            cardRessetId = '200'
        }
        return (cardRessetId + '_rip')
    }
    async getCardIconImage(trainingStatus: boolean): Promise<Image> {
        trainingStatus = this.ableToTraining(trainingStatus)
        const trainingString = trainingStatus ? '_after_training' : '_normal'
        var tempServer = this.getFirstReleasedServer()
        var cardIconImageBuffer = await downloadFileCache(`${Bestdoriurl}/assets/${Server[tempServer]}/thumb/chara/card00${this.getRip()}/${this.resourceSetName}${trainingString}.png`)
        return await loadImage(cardIconImageBuffer)
    }
    async getCardIllustrationImage(trainingStatus: boolean): Promise<Image> {
        trainingStatus = this.ableToTraining(trainingStatus)
        const trainingString = trainingStatus ? '_after_training' : '_normal'
        var tempServer = this.getFirstReleasedServer()
        var CardIllustrationImageBuffer = await downloadFile(`${Bestdoriurl}/assets/${Server[tempServer]}/characters/resourceset/${this.resourceSetName}_rip/card${trainingString}.png`)
        return await loadImage(CardIllustrationImageBuffer)
    }
    async getCardIllustrationImageBuffer(trainingStatus: boolean): Promise<Buffer> {
        trainingStatus = this.ableToTraining(trainingStatus);
        const trainingString = trainingStatus ? '_after_training' : '_normal';
        var tempServer = this.getFirstReleasedServer();
        var cardIllustration = await downloadFile(`${Bestdoriurl}/assets/${Server[tempServer]}/characters/resourceset/${this.resourceSetName}_rip/card${trainingString}.png`);
        return cardIllustration;
    }
    async getCardTrimImage(trainingStatus: boolean): Promise<Image> {
        trainingStatus = this.ableToTraining(trainingStatus)
        const trainingString = trainingStatus ? '_after_training' : '_normal'
        var tempServer = this.getFirstReleasedServer()
        var CardIllustrationImageBuffer = await downloadFile(`${Bestdoriurl}/assets/${Server[tempServer]}/characters/resourceset/${this.resourceSetName}_rip/trim${trainingString}.png`)
        return await loadImage(CardIllustrationImageBuffer)
    }
    getTypeName() {
        if (typeName[this.type] == undefined) {
            return this.type
        }
        return typeName[this.type]
    }
    getMaxLevel(): number {
        var maxLevel = 0
        for (const i in this.stat) {
            if (Object.prototype.hasOwnProperty.call(this.stat, i)) {
                const element = this.stat[i];
                if (!isNaN(Number(i))) {
                    if (Number(i) > maxLevel) {
                        maxLevel = Number(i)
                    }
                }
            }
        }
        return maxLevel
    }
    async getSource() {
        if (!this.isInitFull) {
            await this.initFull()
        }
        var releaseEvent: Array<Array<number>> = []
        var releaseGacha: Array<Array<number>> = []
        for (let k = 0; k < serverList.length; k++) {
            const server = serverList[k]
            var sourceOfServer = this.source[server]
            if (sourceOfServer['event'] != undefined) {
                releaseEvent.push(Object.keys(sourceOfServer['event']).map(Number))
            }
            else {
                releaseEvent.push([])
            }
            if (sourceOfServer['gacha'] != undefined) {
                releaseGacha.push(Object.keys(sourceOfServer['gacha']).map(Number))
            }
            else {
                releaseGacha.push([])
            }
        }
        this.releaseEvent = releaseEvent
        this.releaseGacha = releaseGacha
    }
}

export { limitBreakRankStat }


