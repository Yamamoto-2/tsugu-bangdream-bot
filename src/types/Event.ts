import { callAPIAndCacheResponse } from '../api/getApi';
import mainAPI from './_Main';

export class Event {
    eventID: number;
    isExit: boolean = false;
    isInitFull = false;
    eventType: string;
    eventName: Array<string | null>;
    bannerAssetBundleName: string;
    startAt: Array<number | null>;
    endAt: Array<number | null>;
    attributes: Array<{
        attribute: string;
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
            { musicID: number }
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
        performance: number,
        technique: number,
        visual: number
    }



    constructor(eventID: number) {
        this.eventID = eventID
        const eventData = mainAPI['events'][eventID.toString()]
        if (eventData == undefined) {
            this.isExit = false;
            return
        }
        this.isExit = true;
        this.eventType = eventData['eventType'];
        this.eventName = eventData['eventName'];
        this.bannerAssetBundleName = eventData['bannerAssetBundleName'];
        this.startAt = eventData['startAt'];
        this.endAt = eventData['endAt'];
        this.attributes = eventData['attributes'];
        this.characters = eventData['characters'];
        this.rewardCards = eventData['rewardCards'];
    }
    async initFull() {
        if (mainAPI['events'][this.eventID.toString()] == undefined) {
            this.isExit = false;
            return
        }
        const eventData = await this.getData()
        this.eventType = eventData['eventType'];
        this.eventName = eventData['eventName'];
        this.assetBundleName = eventData['assetBundleName'];
        this.bannerAssetBundleName = eventData['bannerAssetBundleName'];
        this.startAt = eventData['startAt'];
        this.endAt = eventData['endAt'];
        this.attributes = eventData['attributes'];
        this.characters = eventData['characters'];
        this.eventAttributeAndCharacterBonus = eventData['eventAttributeAndCharacterBonus'];
        this.musics = eventData['musics'];
        this.rewardCards = eventData['rewardCards'];
        //other
        //this.enableFlag = eventData['enableFlag'];
        this.publicStartAt = eventData['publicStartAt'];
        this.publicEndAt = eventData['publicEndAt'];
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
        this.isInitFull = true;
    }
    async getData() {
        var eventData = await callAPIAndCacheResponse('https://bestdori.com/api/events/' + this.eventID.toString() + '.json');
        return eventData
    }
}