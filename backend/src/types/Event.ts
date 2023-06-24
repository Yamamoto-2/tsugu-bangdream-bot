import { callAPIAndCacheResponse } from '../api/getApi';
import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'
import { Server, getServerByPriority } from './Server'
import mainAPI from './_Main';
import { Attribute } from './Attribute';
import { Character } from './Character';
import { globalDefaultServer } from '../config';
import { stringToNumberArray } from './utils'

var eventDataCache = {}

const typeName = {
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
    eventType: string;
    eventName: Array<string | null>;
    bannerAssetBundleName: string;
    startAt: Array<number | null>;
    endAt: Array<number | null>;
    attributes: Array<{
        attribute: "happy" | "cool" | "powerful" | "pure";
        percent: number;
    }>;
    characters: Array<{
        characterId: number;
        percent: number;
    }>;
    eventAttributeAndCharacterBonus: {
        pointPercent: number;
        parameterPercent: number;
    }
    musics?: Array<
        Array<
            {
                musicID: number,
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
    rewardCards: Array<number>

    //other
    //enableFlag: Array<null>;
    assetBundleName: string;
    publicStartAt: Array<number | null>;
    publicEndAt: Array<number | null>;
    /*
    distributionStartAt: Array<number | null>;
    distributionEndAt: Array<number | null>;
    bgmAssetBundleName: string;
    bgmFileName: string;
    aggregateEndAt: Array<number | null>;
    exchangeEndAt: Array<number | null>;
    */
    pointRewards: Array<
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
    rankingRewards: Array<
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
    eventCharacterParameterBonus?: {//偏科
        performance?: number,
        technique?: number,
        visual?: number
    } = {}

    //以下用于模糊搜索
    characterId: string[] 
    attribute: string[] 
    bandId: string[] 

    isInitfull: boolean = false

    constructor(eventId: number) {
        this.eventId = eventId
        const eventData = mainAPI['events'][eventId.toString()]
        if (eventData == undefined) {
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
        this.characterId =[]
        for (let i = 0; i < this.characters.length; i++) {
            const element = this.characters[i];
            this.characterId.push(element.characterId.toString())
        }
        this.attribute =[]
        for (let i = 0; i < this.attributes.length; i++) {
            const element = this.attributes[i];
            this.attribute.push(element.attribute)
        }
        //如果所有character来自同一个band，则bandId为该bandId
        this.bandId = []
        let isSameBand = true
        for (var i = 0; i < this.characters.length; i++) {
            if (new Character(this.characters[i].characterId).bandId != new Character(this.characters[0].characterId).bandId) {
                isSameBand = false
                break
            }
        }
        if (isSameBand) {
            this.bandId.push(new Character(this.characters[0].characterId).bandId.toString())
        }
    }
    async initFull(update: boolean = true) {
        if(this.isInitFull){
            return
        }

        if (this.isExist == false) {
            return
        }
        if (eventDataCache[this.eventId.toString()] != undefined && !update) {
            var eventData = eventDataCache[this.eventId.toString()]
        }
        else {
            var eventData = await this.getData(update)
            eventDataCache[this.eventId.toString()] = eventData
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
        //other
        //this.enableFlag = eventData['enableFlag'];
        this.publicStartAt = stringToNumberArray(eventData['publicStartAt']);
        this.publicEndAt = stringToNumberArray(eventData['publicEndAt']);
        this.pointRewards = eventData['pointRewards'];
        this.rankingRewards = eventData['rankingRewards'];
        /*
        this.distributionStartAt = eventData['distributionStartAt'];
        this.distributionEndAt = eventData['distributionEndAt'];
        this.bgmAssetBundleName = eventData['bgmAssetBundleName'];
        this.bgmFileName = eventData['bgmFileName'];
        this.aggregateEndAt = eventData['aggregateEndAt'];
        this.exchangeEndAt = eventData['exchangeEndAt'];
        */
        if (eventData['eventCharacterParameterBonus'] != undefined) {
            this.eventCharacterParameterBonus = eventData['eventCharacterParameterBonus']
        }

        this.isInitfull = true
    }
    async getData(update: boolean = true) {
        var time = update ? 0 : 1 / 0
        var eventData = await callAPIAndCacheResponse(`https://bestdori.com/api/events/${this.eventId}.json`, time);
        return eventData
    }
    async getBannerImage(defaultServerList: Server[] = globalDefaultServer): Promise<Image> {
        if (!defaultServerList) defaultServerList = globalDefaultServer
        var server = getServerByPriority(this.startAt, defaultServerList)
        try {
            var BannerImageBuffer = await downloadFileCache(`https://bestdori.com/assets/${Server[server]}/homebanner_rip/${this.bannerAssetBundleName}.png`, false)
            return await loadImage(BannerImageBuffer)
        } catch (e) {
            var server = Server.jp
            var BannerImageBuffer = await downloadFileCache(`https://bestdori.com/assets/${Server[server]}/homebanner_rip/${this.bannerAssetBundleName}.png`)
            return await loadImage(BannerImageBuffer)
        }
    }
    async getEventBGImage(): Promise<Image> {
        var server = Server.jp
        var BannerImageBuffer = await downloadFileCache(`https://bestdori.com/assets/${Server[server]}/event/${this.assetBundleName}/topscreen_rip/bg_eventtop.png`)
        return await loadImage(BannerImageBuffer)
    }
    getTypeName() {
        if (typeName[this.eventType] == undefined) {
            return this.eventType
        }
        return typeName[this.eventType]
    }
    getAttributeList() {//反向排序加成，返回{percent:[attribute]}
        var attribute = this.attributes
        var attributeList: { [precent: string]: Array<Attribute> } = {}
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
        return (attributeList)
    }
    getCharacterList() {
        var character = this.characters
        var characterList: { [precent: string]: Array<Character> } = {}
        for (const i in character) {
            if (Object.prototype.hasOwnProperty.call(character, i)) {
                const element = character[i];
                var percent = element.percent
                if (characterList[percent.toString()] == undefined) {
                    characterList[percent.toString()] = []
                }
                characterList[percent.toString()].push(new Character(element.characterId))
            }
        }
        return (characterList)
    }
}

//获取当前进行中的活动,如果期间没有活动，则返回上一个刚结束的活动
export function getPresentEvent(server: Server, time?: number) {
    if (!time) {
        time = Date.now()
    }
    var eventList: Array<number> = []
    var eventListMain = mainAPI['events']
    for (var key in eventListMain) {
        var event = new Event(parseInt(key))
        //如果在活动进行时
        if (event.startAt[server] != null && event.endAt[server] != null) {
            if (event.startAt[server] - 1000 * 60 * 60 * 24 <= time && event.endAt[server] >= time) {
                //提前一天
                eventList.push(parseInt(key))
            }
        }
    }

    //如果没有活动进行中，则返回上一个刚结束的活动
    if (eventList.length == 0) {
        for (var key in eventListMain) {
            var event = new Event(parseInt(key))
            //如果在活动进行时
            if (event.startAt[server] != null && event.endAt[server] != null) {
                if (event.endAt[server] <= time) {
                    eventList.push(parseInt(key))
                }
            }
        }
    }

    //如果没有活动，则返回null
    if (eventList.length == 0) {
        return null
    }

    //如果有多个活动，则返回最后一个
    return new Event(eventList[eventList.length - 1])
}

//根据服务器，将活动列表排序
export function sortEventList(tempEventList: Event[], defaultServerList: Server[] = globalDefaultServer) {
    tempEventList.sort((a, b) => {
        for (var i = 0; i < defaultServerList.length; i++) {
            var server = defaultServerList[i]
            if (a.startAt[server] == null || b.startAt[server] == null) {
                continue
            }
            if (a.startAt[server] != b.startAt[server]) {
                return a.startAt[server] - b.startAt[server]
            }
        }
    })
}

//通过活动与服务器，获得活动类型相同的 前5期活动
export function getSameTypeEventListByEventAndServer(event: Event, server: Server) {
    const eventIdList: Array<number> = Object.keys(mainAPI['events']).map(Number)
    var tempEventList: Array<Event> = []
    for (var i = 0; i < eventIdList.length; i++) {
        var tempEvent = new Event(eventIdList[i])
        if (tempEvent.eventType == event.eventType && tempEvent.startAt[server] != null) {
            if(tempEvent.startAt[server] >= event.startAt[server]){
                continue
            }
            tempEventList.push(tempEvent)
        }
    }
    sortEventList(tempEventList, [server])
    return tempEventList.slice(tempEventList.length - 5, tempEventList.length)
}