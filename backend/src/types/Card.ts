/**
 * Card domain type
 * Migrated from backend_old/src/types/Card.ts
 * Removed: HTTP calls (getData, initFull HTTP part), rendering methods (getCardIconImage, getCardIllustrationImage, etc.)
 * 
 * Note: Constructor still depends on mainAPI and Character/Skill types
 * This will be refactored to use BestdoriClient in the future
 */

import { Server, getServerByPriority, serverList } from './Server'
import { stringToNumberArray, formatNumber } from './utils'

export interface Stat {
    performance: number,
    technique: number,
    visual: number
}

const typeName: { [key: string]: string } = {
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

export function addStat(stat: Stat, add: Stat): void {
    stat.performance += add.performance
    stat.technique += add.technique
    stat.visual += add.visual
}

export function limitBreakRankStat(rarity: number): Stat {
    var tempStat: Stat = {
        performance: 50 * rarity,
        technique: 50 * rarity,
        visual: 50 * rarity
    }
    return tempStat
}

export class Card {
    cardId: number;
    isExist: boolean = false;
    data!: object;
    characterId!: number;
    rarity!: number;
    type!: string;
    attribute!: 'cool' | 'happy' | 'pure' | 'powerful'
    levelLimit!: number;
    resourceSetName!: string;
    sdResourceName!: string;
    costumeId!: number;
    gachaText!: Array<string | null>;
    prefix!: Array<string | null>;
    releasedAt!: Array<number | null>;
    skillName!: Array<string | null>;
    source!: Array<{
        [type: string]: {
            [id: string]: object
        }
    } | {}>;
    skillId!: number;
    isInitFull: boolean = false;
    stat!: Record<string, Stat | { training?: Stat; episodes?: [Stat, Stat] }> & {
        training?: Stat;
        episodes?: [Stat, Stat];
    };
    bandId!: number;

    //other
    skillType!: string;
    scoreUpMaxValue!: number;
    releaseGacha!: Array<Array<number>>;
    releaseEvent!: Array<Array<number>>;

    /**
     * Constructor - creates Card from cardId
     * TODO: In the future, cardData should be provided via BestdoriClient
     * Also depends on Character and Skill types - these dependencies need to be resolved
     */
    constructor(cardId: number, cardData?: any, characterBandId?: number, skillEffectTypes?: string[], skillScoreUpMaxValue?: number) {
        this.cardId = cardId
        
        if (!cardData) {
            this.isExist = false;
            return
        }

        this.isExist = true;
        this.data = cardData
        this.characterId = cardData['characterId']
        this.bandId = characterBandId || cardData['bandId'] // Use provided or fallback to data
        this.rarity = cardData['rarity']
        this.type = cardData['type']
        this.attribute = cardData['attribute']
        this.levelLimit = cardData['levelLimit']
        this.resourceSetName = cardData['resourceSetName']
        this.prefix = cardData['prefix']
        this.releasedAt = stringToNumberArray(cardData['releasedAt'])
        this.skillId = cardData['skillId']
        this.stat = cardData['stat']
        
        // Skill-related fields - use provided values or defaults
        this.skillType = skillEffectTypes?.[0] || 'score'
        this.scoreUpMaxValue = skillScoreUpMaxValue || 0
    }

    /**
     * Initialize full card data from provided cardData
     * This replaces the old initFull() which made HTTP calls
     * TODO: Event and Gacha dependencies need to be resolved (currently commented out)
     */
    initFromFullData(cardData: any, eventStartAtMap?: Map<number, Array<number | null>>, gachaPublishedAtMap?: Map<number, Array<number | null>>): void {
        if (this.isInitFull) {
            return
        }
        if (this.isExist == false) {
            return
        }

        this.isInitFull = true;
        this.data = cardData
        this.sdResourceName = cardData['sdResourceName']
        this.costumeId = cardData['costumeId']
        this.gachaText = cardData['gachaText']
        this.source = cardData['source']
        
        // Fix CN server releaseAt issue - use event or gacha start time
        // TODO: This logic depends on Event and Gacha types - need to refactor
        // The getSource() call and CN server fix logic should be handled by the service layer

        this.skillName = cardData['skillName']
        this.skillId = cardData['skillId']
        this.stat = cardData['stat']
    }

    ableToTraining(trainingStatus?: boolean): boolean {
        if (this.rarity < 3) {
            return false
        }
        const training = this.stat['training'];
        if (training && training.performance == 0 && training.technique == 0 && training.visual == 0) {
            return true
        }
        return trainingStatus ?? true
    }

    getTrainingStatusList(): Array<boolean> {
        var trainingStatusList: Array<boolean> = []
        if (this.rarity < 3) {
            trainingStatusList.push(false)
            return trainingStatusList
        }
        const training = this.stat['training'];
        if (training && training.performance == 0 && training.technique == 0 && training.visual == 0) {
            trainingStatusList.push(true)
            return trainingStatusList
        }
        return [false, true]
    }

    /**
     * Calculate card stat
     * Pure calculation function - no IO
     */
    calcStat(cardData?: any): Stat {
        if (!this.isInitFull) {
            // In the future, this should throw an error or require initFromFullData to be called first
            throw new Error('Card data not fully initialized. Call initFromFullData() first.')
        }
        const level = cardData ? cardData.level : this.getMaxLevel()
        const levelStat = this.stat[level.toString()];
        if (!levelStat) {
            throw new Error(`Card stat for level ${level} not found`);
        }
        const stat: Stat = { ...levelStat } as Stat
        
        if (cardData) {
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
        if(this.stat['training'] != undefined){
            addStat(stat, this.stat['training'] as Stat)
        }
        if (this.stat['episodes'] != undefined) {
            addStat(stat, this.stat['episodes'][0] as Stat)
            addStat(stat, this.stat['episodes'][1] as Stat)
        }

        return stat
    }

    isReleased(server: Server): boolean {
        if (this.releasedAt[server] == null) {
            return false
        }
        return true
    }

    getFirstReleasedServer(displayedServerList?: Server[]): Server {
        // TODO: globalDefaultServer should come from config/constants.ts
        const defaultDisplayedServerList = displayedServerList || [Server.cn, Server.jp]
        return getServerByPriority(this.releasedAt, defaultDisplayedServerList) || Server.jp
    }

    getRip(): string {
        if (this.cardId < 9999) {
            var cardRessetIdNumber: number = Math.floor(this.cardId / 50)
            var cardRessetId: string = formatNumber(cardRessetIdNumber, 3)
        }
        else {
            var cardRessetId = '200'
        }
        return (cardRessetId + '_rip')
    }

    getTypeName(): string {
        if (typeName[this.type] == undefined) {
            return this.type
        }
        return typeName[this.type]
    }

    getMaxLevel(): number {
        var maxLevel = 0
        for (const i in this.stat) {
            if (Object.prototype.hasOwnProperty.call(this.stat, i)) {
                if (!isNaN(Number(i))) {
                    if (Number(i) > maxLevel) {
                        maxLevel = Number(i)
                    }
                }
            }
        }
        return maxLevel
    }

    /**
     * Get source (release event and gacha) from source data
     * Pure function - no IO
     */
    getSource(): void {
        if (!this.isInitFull) {
            // In the future, this should throw an error or require initFromFullData to be called first
            throw new Error('Card data not fully initialized. Call initFromFullData() first.')
        }
        var releaseEvent: Array<Array<number>> = []
        var releaseGacha: Array<Array<number>> = []
        for (let k = 0; k < serverList.length; k++) {
            const server = serverList[k]
            var sourceOfServer = this.source[server]
            if (sourceOfServer && typeof sourceOfServer === 'object' && 'event' in sourceOfServer) {
                releaseEvent.push(Object.keys(sourceOfServer['event'] as object).map(Number))
            }
            else {
                releaseEvent.push([])
            }
            if (sourceOfServer && typeof sourceOfServer === 'object' && 'gacha' in sourceOfServer) {
                releaseGacha.push(Object.keys(sourceOfServer['gacha'] as object).map(Number))
            }
            else {
                releaseGacha.push([])
            }
        }
        this.releaseEvent = releaseEvent
        this.releaseGacha = releaseGacha
    }
}

