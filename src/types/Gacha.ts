import { callAPIAndCacheResponse } from '../api/getApi';
import mainAPI from './_Main';
import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'
import { Server, serverList } from './Server';
import { Event } from './Event';

const typeName = {
    "permanent": "常驻",
    "special": "特殊",
    "birthday": "生日限定",
    "free": "免费",
    "dreamfes": "梦幻Fes限定",
    "kirafes": "闪光Fes限定",
    "limited": "期间限定",
    "miracle": "奇迹兑换券"
}

export class Gacha {
    gachaId: number;
    isExist = false
    data: object;
    resourceName: string;
    bannerAssetBundleName: string;
    gachaName: Array<string | null>;
    publishedAt: Array<number | null>;
    closedAt: Array<number | null>;
    type: string;
    newCards: Array<number | null>;

    //other
    details: Array<{
        [cardId: string]: {
            rarityIndex: number,
            weight: number,
            pickUp: boolean
        };
    } | null>;
    rates: Array<{
        [rarity: string]: {
            rate: number,
            weightTotal: number
        }
    }>
    paymentMethods: Array<{
        gachaId: number,
        paymentType: string,
        quantity: number,
        paymentMethodId: number,
        count: number,
        behavior: string,
        pickup: boolean,
        maxSpinLimit: number,
        costItemQuantity: number,
        discountType: number
    }>
    description: Array<string | null>;
    annotation: Array<string | null>;
    gachaPeriod: Array<string | null>;
    gachaType: string;
    information: {
        description: Array<string | null>,
        term: Array<string | null>,
        newMemberInfo: Array<string | null>,
        notice: Array<string | null>,
    }

    constructor(gachaId: number) {
        this.gachaId = gachaId
        const gachaData = mainAPI['gacha'][gachaId.toString()]
        if (gachaData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.data = gachaData
        this.resourceName = gachaData['resourceName']
        this.bannerAssetBundleName = gachaData['bannerAssetBundleName']
        this.gachaName = gachaData['gachaName']
        this.publishedAt = gachaData['publishedAt']
        this.closedAt = gachaData['closedAt']
        this.type = gachaData['type']
        this.newCards = gachaData['newCards']
    }
    async initFull() {
        if (this.isExist == false) {
            return
        }
        this.isExist = true;
        const gachaData = await this.getData();
        this.resourceName = gachaData['resourceName'];
        this.bannerAssetBundleName = gachaData['bannerAssetBundleName'];
        this.gachaName = gachaData['gachaName'];
        this.publishedAt = gachaData['publishedAt'];
        this.closedAt = gachaData['closedAt'];
        this.type = gachaData['type'];
        this.newCards = gachaData['newCards'];

        //other
        this.details = gachaData['details'];
        this.rates = gachaData['rates'];
        this.paymentMethods = gachaData['paymentMethods'];
        this.description = gachaData['description'];
        this.annotation = gachaData['annotation'];
        this.gachaPeriod = gachaData['gachaPeriod'];
        this.gachaType = gachaData['gachaType'];
        this.information = gachaData['information'];
    }
    async getData() {
        const gachaData = await callAPIAndCacheResponse(`https://bestdori.com/api/gacha/${this.gachaId}.json`)
        return gachaData
    }
    async getBannerImage(): Promise<Image> {
        var BannerImageBuffer = await downloadFileCache(`https://bestdori.com/assets/jp/homebanner_rip/${this.bannerAssetBundleName}.png`)
        return await loadImage(BannerImageBuffer)
    }
    getEventId() {
        var eventList:Array<number> = []
        var eventListMain = mainAPI['events']
        for (let i = 0; i < serverList.length; i++) {
            const element = serverList[i];
            var server = new Server(element)
            var haveEvent = false
            for(var key in eventListMain){
                var event = new Event(parseInt(key))
                //如果gacha发生在活动进行时
                if(event.startAt[server.serverId] <= this.publishedAt[server.serverId] && event.endAt[server.serverId] >= this.closedAt[server.serverId]){
                    eventList.push(parseInt(key))
                    haveEvent = true
                    break
                }
            }
            if(!haveEvent){
                eventList.push(null)
            }
        }
        return eventList
    }
    getTypeName() {
        if (typeName[this.type] == undefined) {
            return this.type
        }
        return typeName[this.type]
    }
}

export function getEarlistGachaFromList(gachaList: {[gachaId:string]:{
    probability: number,
}},server:Server):Gacha | null{
    var earlistTime = 1/0 //无穷大
    var earlistGacha:Gacha
    for (const gachId in gachaList) {
        if (Object.prototype.hasOwnProperty.call(gachaList, gachId)) {
            var gacha = new Gacha(parseInt(gachId))
            if(gacha.publishedAt[server.serverId] < earlistTime){
                earlistTime = gacha.publishedAt[server.serverId]
                earlistGacha = gacha
            }
        }
    }
    if(earlistTime == 1/0){
        return null
    }
    return earlistGacha
}