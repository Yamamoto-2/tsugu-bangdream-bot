import { callAPIAndCacheResponse } from '../api/getApi'
import { Skill } from './Skill'
import { Server } from './Server'

import mainAPI from './_Main'

interface Stat {//综合力
    performance: number,
    technique: number,
    visual: number
}

function addStat(stat: Stat, add: Stat): void {//综合力相加函数
    stat.performance += add.performance
    stat.technique += add.technique
    stat.visual += add.visual
}

const limitBreakRankStat = {//不同稀有度突破一级增加的属性
    1: {
        performance: 50,
        technique: 50,
        visual: 50
    },
    2: {
        performance: 100,
        technique: 100,
        visual: 100
    },
    3: {
        performance: 150,
        technique: 150,
        visual: 150
    },
    4: {
        performance: 200,
        technique: 200,
        visual: 200
    },
    5: {
        performance: 250,
        technique: 250,
        visual: 250
    }
}

export class Card {
    cardId: Number;
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
    releasedAt: Array<string | null>;
    skillName: Array<string | null>;
    skillId: number;
    isInitFull: boolean = false;
    stat: object;

    constructor(cardId: Number) {
        this.cardId = cardId
        const cardData = mainAPI['cards'][cardId.toString()]
        if (cardData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.data = cardData
        this.characterId = cardData['characterId']
        this.rarity = cardData['rarity']
        this.type = cardData['type']
        this.attribute = cardData['attribute']
        this.levelLimit = cardData['levelLimit']
        this.resourceSetName = cardData['resourceSetName']
        this.prefix = cardData['prefix']
        this.releasedAt = cardData['releasedAt']
        this.skillId = cardData['skillId']
        this.stat = cardData['stat']
    }
    async initFull() {
        if (this.isExist == false) {
            return
        }
        this.isExist = true;
        const cardData = await this.getData()
        this.data = cardData
        this.characterId = cardData['characterId']
        this.rarity = cardData['rarity']
        this.type = cardData['type']
        this.attribute = cardData['attribute']
        this.levelLimit = cardData['levelLimit']
        this.resourceSetName = cardData['resourceSetName']
        this.sdResourceName = cardData['sdResourceName']
        this.costumeId = cardData['costumeId']
        this.gachaText = cardData['gachaText']
        this.prefix = cardData['prefix']
        this.releasedAt = cardData['releasedAt']
        this.skillName = cardData['skillName']
        this.skillId = cardData['skillId']
        this.stat = cardData['stat']
        this.isInitFull = true;
    }
    async getData() {
        var cardData = await callAPIAndCacheResponse('https://bestdori.com/api/cards/' + this.cardId + '.json')
        return cardData
    }


    ableToTraining(): boolean {//判断是否能够进行特训
        if (this.rarity < 3) {
            return false
        }
        if (this.stat['training']['performance'] == 0 && this.stat['training']['technique'] == 0 && this.stat['training']['visual'] == 0) {
            return false
        }
        return true
    }

    //计算综合力函数
    async calcStat(level: number = this.levelLimit, trainingStatus: boolean = false, limitBreakRank: number = 0, episode1: boolean = true, episode2: boolean = true) {
        if (!this.isInitFull) {
            //如果不是默认情况(带有level以外的参数)，加载完整数据，其中包含完整综合力数据
            if (trainingStatus != undefined || limitBreakRank != undefined || episode1 != undefined || episode2 != undefined) {
                await this.initFull()
            }
        }
        const stat: Stat = {
            performance: 0,
            technique: 0,
            visual: 0
        }

        if (level > this.levelLimit) {//等级超过上限,按上限计算
            level = this.levelLimit
        }
        if (this.ableToTraining()) {//如果能够进行特训
            if (level > this.levelLimit - this.stat['training']['levelLimit']) {//如果等级超过需要特训等级，则默认已经特训
                trainingStatus = true
            }
        }

        addStat(stat, this.stat[level.toString()])//加上等级对应的属性

        if (trainingStatus) {//如果已经特训
            addStat(stat, this.stat['training'])
        }

        if (episode1) {//如果已经阅读剧情1
            addStat(stat, this.stat['episodes'][0])
        }
        if (episode2) {//如果已经阅读剧情2
            addStat(stat, this.stat['episodes'][1])
        }
        if (limitBreakRank > 0) {
            for (var i = 1; i <= limitBreakRank; i++) {
                addStat(stat, limitBreakRankStat[this.rarity])
            }
        }
        return stat
    }
    getSkill(): Skill {
        return new Skill(this.skillId)
    }
    isReleased(server: Server): boolean {
        if (this.releasedAt[server.serverId] == null) {
            return false
        }
        return true
    }

}