import { callAPIAndCacheResponse } from '../api/getApi'
import { BestdoriapiPath, Bestdoriurl } from '../config'

interface Stat {
    performance: number,
    technique: number,
    visual: number
}
function addStat(stat: Stat, add: Stat): void {
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
    cardID: Number;
    isExit: boolean = false;

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

    constructor(cardID: Number) {
        this.cardID = cardID
    }
    async init() {
        var cardList: object = await callAPIAndCacheResponse(Bestdoriurl + BestdoriapiPath['cards'])
        if (cardList[this.cardID.toString()] == undefined) {
            this.isExit = false;
            return
        }
        this.isExit = true;
        this.data = await this.getData()
        this.characterId = this.data['characterId']
        this.rarity = this.data['rarity']
        this.type = this.data['type']
        this.attribute = this.data['attribute']
        this.levelLimit = this.data['levelLimit']
        this.resourceSetName = this.data['resourceSetName']
        this.sdResourceName = this.data['sdResourceName']
        this.costumeId = this.data['costumeId']
        this.gachaText = this.data['gachaText']
        this.prefix = this.data['prefix']
        this.releasedAt = this.data['releasedAt']
        this.skillName = this.data['skillName']
        this.skillId = this.data['skillId']
    }
    async getData() {
        var cardData = await callAPIAndCacheResponse('https://bestdori.com/api/cards/' + this.cardID + '.json')
        return cardData
    }


    ableToTraining(): boolean {//判断是否能够进行特训
        if (this.rarity < 3) {
            return false
        }
        var statData = this.data['stat']
        if (statData['training']['performance'] == 0 && statData['training']['technique'] == 0 && statData['training']['visual'] == 0) {
            return false
        }
        return true
    }

    //计算综合力函数
    calcStat(level: number = this.levelLimit, trainingStatus: boolean = false, limitBreakRank: number = 0, episode1: boolean = true, episode2: boolean = true) {
        const stat: Stat = {
            performance: 0,
            technique: 0,
            visual: 0
        }

        if (level > this.levelLimit) {//等级超过上限,按上限计算
            level = this.levelLimit
        }
        var statData = this.data['stat']
        if (this.ableToTraining()) {//如果能够进行特训
            if (level > this.levelLimit - statData['training']['levelLimit']) {//如果等级超过需要特训等级，则默认已经特训
                trainingStatus = true
            }
        }

        addStat(stat, statData[level.toString()])//加上等级对应的属性

        if (trainingStatus) {//如果已经特训
            addStat(stat, statData['training'])
        }

        if (episode1) {//如果已经阅读剧情1
            addStat(stat, statData['episodes'][0])
        }
        if (episode2) {//如果已经阅读剧情1
            addStat(stat, statData['episodes'][1])
        }
        if(limitBreakRank > 0){
            for(var i = 1;i <= limitBreakRank;i++){
                addStat(stat,limitBreakRankStat[this.rarity])
            }
        }
        return stat
    }

}