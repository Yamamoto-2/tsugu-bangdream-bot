/**
 * Event domain type
 * Migrated from backend_old/src/types/Event.ts
 * Removed: HTTP calls (getData, initFull HTTP part), rendering methods (getBannerImage, getEventBGImage, etc.)
 * 
 * Note: Constructor still depends on mainAPI and Character type for bandId calculation
 * This will be refactored to use BestdoriClient in the future
 */

import { Server, getServerByPriority } from './Server'
import { Attribute } from './Attribute'
import { stringToNumberArray } from './utils'

const typeName: { [key: string]: string } = {
    "story": "一般活动 (协力)",
    "versus": "竞演LIVE (对邦)",
    "live_try": "LIVE试炼 (EX)",
    "challenge": "挑战LIVE (CP)",
    "mission_live": "任务LIVE (协力)",
    "festival": "团队LIVE FES (5v5)",
    "medley": "组曲LIVE (3组曲)"
}

export class Event {
    eventId: number;
    isExist: boolean = false;
    isInitFull = false;
    eventType!: string;
    eventName!: Array<string | null>;
    bannerAssetBundleName!: string;
    startAt!: Array<number | null>;
    endAt!: Array<number | null>;
    attributes!: Array<{
        attribute: "happy" | "cool" | "powerful" | "pure";
        percent: number;
    }>;
    characters!: Array<{
        characterId: number;
        percent: number;
    }>;
    eventAttributeAndCharacterBonus!: {
        pointPercent: number;
        parameterPercent: number;
    }
    musics?: Array<
        Array<
            {
                musicId: number,
                musicRankingRewards?: Array<{
                    fromRank: number,
                    toRank: number,
                    resourceType: string,
                    resourceId: number,
                    quantity: number
                }>
            }
        >
        | null>
    rewardCards!: Array<number>

    //other
    assetBundleName!: string;
    publicStartAt!: Array<number | null>;
    publicEndAt!: Array<number | null>;
    pointRewards!: Array<
        Array<
            {
                point: string,
                rewardType: string,
                rewardId?: number
                rewardQuantity: number,
            }
        >
        | null
    >
    rankingRewards!: Array<
        Array<
            {
                fromRank: number,
                toRank: number,
                rewardType: string,
                rewardId: number
                rewardQuantity: number,
            }
        >
        | null
    >
    eventCharacterParameterBonus?: {
        performance?: number,
        technique?: number,
        visual?: number
    } = {}

    //以下用于模糊搜索
    characterId!: number[]
    attribute!: string[]
    bandId!: number[]

    isInitfull: boolean = false

    /**
     * Constructor - creates Event from eventId
     * TODO: In the future, eventData should be provided via BestdoriClient
     * Also depends on Character type for bandId calculation - this dependency needs to be resolved
     */
    constructor(eventId: number, eventData?: any, characterBandIdMap?: Map<number, number>) {
        this.eventId = eventId
        
        if (!eventData) {
            this.isExist = false;
            return
        }

        this.isExist = true;
        this.eventType = eventData['eventType'];
        this.eventName = eventData['eventName'];
        this.bannerAssetBundleName = eventData['bannerAssetBundleName'];
        this.startAt = stringToNumberArray(eventData['startAt']);
        this.endAt = stringToNumberArray(eventData['endAt']);
        this.attributes = eventData['attributes'];
        this.characters = eventData['characters'];
        this.rewardCards = eventData['rewardCards'];
        
        //用于模糊搜索
        this.characterId = []
        for (let i = 0; i < this.characters.length; i++) {
            const element = this.characters[i];
            this.characterId.push(element.characterId)
        }
        this.attribute = []
        for (let i = 0; i < this.attributes.length; i++) {
            const element = this.attributes[i];
            this.attribute.push(element.attribute)
        }
        
        //如果所有character来自同一个band，则bandId为该bandId
        // TODO: This logic depends on Character type - use characterBandIdMap if provided
        this.bandId = []
        if (characterBandIdMap && this.characters.length > 0) {
            let isSameBand = true
            const firstBandId = characterBandIdMap.get(this.characters[0].characterId)
            for (var i = 1; i < this.characters.length; i++) {
                const bandId = characterBandIdMap.get(this.characters[i].characterId)
                if (bandId != firstBandId) {
                    isSameBand = false
                    break
                }
            }
            if (isSameBand && firstBandId !== undefined) {
                this.bandId.push(firstBandId)
            } else {
                this.bandId.push(0)
            }
        } else {
            // Fallback: assume same band if no map provided
            this.bandId.push(0)
        }
    }

    /**
     * Initialize full event data from provided eventData
     * This replaces the old initFull() which made HTTP calls
     */
    initFromFullData(eventData: any): void {
        if (this.isInitFull) {
            return
        }

        if (this.isExist == false) {
            return
        }

        this.isInitFull = true;
        this.eventType = eventData['eventType'];
        this.eventName = eventData['eventName'];
        this.assetBundleName = eventData['assetBundleName'];
        this.bannerAssetBundleName = eventData['bannerAssetBundleName'];
        this.startAt = stringToNumberArray(eventData['startAt']);
        this.endAt = stringToNumberArray(eventData['endAt']);
        this.attributes = eventData['attributes'];
        this.characters = eventData['characters'];
        this.eventAttributeAndCharacterBonus = eventData['eventAttributeAndCharacterBonus'];
        this.musics = eventData['musics'];
        this.rewardCards = eventData['rewardCards'];
        this.publicStartAt = stringToNumberArray(eventData['publicStartAt']);
        this.publicEndAt = stringToNumberArray(eventData['publicEndAt']);
        this.pointRewards = eventData['pointRewards'];
        this.rankingRewards = eventData['rankingRewards'];
        
        if (eventData['eventCharacterParameterBonus'] != undefined) {
            this.eventCharacterParameterBonus = eventData['eventCharacterParameterBonus']
        }

        this.isInitfull = true
    }

    getTypeName(): string {
        if (typeName[this.eventType] == undefined) {
            return this.eventType
        }
        return typeName[this.eventType]
    }

    /**
     * Get attribute list grouped by percent
     * Pure function - no IO
     */
    getAttributeList(): { [percent: string]: Array<Attribute> } {
        var attribute = this.attributes
        var attributeList: { [percent: string]: Array<Attribute> } = {}
        for (const i in attribute) {
            if (Object.prototype.hasOwnProperty.call(attribute, i)) {
                const element = attribute[i];
                var percent = element.percent
                if (attributeList[percent.toString()] == undefined) {
                    attributeList[percent.toString()] = []
                }
                attributeList[percent.toString()].push(new Attribute(element.attribute))
            }
        }
        return attributeList
    }

    /**
     * Get character list grouped by percent
     * TODO: This depends on Character type - should return characterId array instead
     */
    getCharacterList(): { [percent: string]: Array<number> } {
        var character = this.characters
        var characterList: { [percent: string]: Array<number> } = {}
        for (const i in character) {
            if (Object.prototype.hasOwnProperty.call(character, i)) {
                const element = character[i];
                var percent = element.percent
                if (characterList[percent.toString()] == undefined) {
                    characterList[percent.toString()] = []
                }
                characterList[percent.toString()].push(element.characterId)
            }
        }
        return characterList
    }

    /**
     * Get event status for a server
     * Pure function - no IO
     */
    getEventStatus(server: Server, time?: number): 'not_start' | 'in_progress' | 'ended' {
        if (!time) {
            time = Date.now()
        }
        if (this.startAt[server] == null || this.endAt[server] == null) {
            return 'not_start'
        }
        if (time < this.startAt[server]) {
            return 'not_start'
        }
        if (time > this.endAt[server]) {
            return 'ended'
        }
        return 'in_progress'
    }
}

/**
 * Sort event list by displayed server list
 * Pure function - no IO
 */
export function sortEventList(tempEventList: Event[], displayedServerList: Server[] = [Server.cn, Server.jp]) {
    tempEventList.sort((a, b) => {
        for (var i = 0; i < displayedServerList.length; i++) {
            var server = displayedServerList[i]
            if (a.startAt[server] == null || b.startAt[server] == null) {
                continue
            }
            if (a.startAt[server] != b.startAt[server]) {
                return a.startAt[server]! - b.startAt[server]!
            }
        }
        return 0
    })
}

