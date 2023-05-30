import { callAPIAndCacheResponse } from '../api/getApi';
import mainAPI from './_Main';
import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'
import { Server, getServerByPriority, serverList } from './Server';
import { Event, getPresentEvent } from './Event';

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
        paymentMethod: string,
        gachaId: number,
        paymentType: string,
        quantity: number,
        paymentMethodId: number,
        count: number,
        behavior: string,
        pickup: boolean,
        maxSpinLimit: number,
        costItemQuantity: number,
        discountType: number,
        ticketId:number
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
        try{
            var BannerImageBuffer = await downloadFileCache(`https://bestdori.com/assets/jp/homebanner_rip/${this.bannerAssetBundleName}.png`,false)
            return await loadImage(BannerImageBuffer)
        }
        catch(e){
            return(this.getGachaLogo())
        }
    }
    async getGachaBGImage():Promise<Image>{
        var server = getServerByPriority(this.publishedAt)
        var BGImageBuffer = await downloadFileCache(`https://bestdori.com/assets/${server.serverName}/gacha/screen/${this.resourceName}_rip/bg.png`)
        return await loadImage(BGImageBuffer)
    }
    async getGachaLogo():Promise<Image>{
        var server = getServerByPriority(this.publishedAt)
        var LogoImageBuffer = await downloadFileCache(`https://bestdori.com/assets/${server.serverName}/gacha/screen/${this.resourceName}_rip/logo.png`)
        return await loadImage(LogoImageBuffer)
    }
    getEventId() {
        var eventList: Array<number> = []
        for (let i = 0; i < serverList.length; i++) {
            const serverName = serverList[i];
            var server = new Server(serverName)
            var tempEvent = getPresentEvent(server, this.publishedAt[server.serverId])
            if (tempEvent != null) {
                eventList.push(tempEvent.eventId)
            }
            else {
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

export function getEarlistGachaFromList(gachaList: {
    [gachaId: string]: {
        probability: number,
    }
}, server: Server): Gacha | null {
    var earlistTime = 1 / 0 //无穷大
    var earlistGacha: Gacha
    for (const gachId in gachaList) {
        if (Object.prototype.hasOwnProperty.call(gachaList, gachId)) {
            var gacha = new Gacha(parseInt(gachId))
            if(!gacha.isExist){
                continue
            }
            if (gacha.publishedAt[server.serverId] < earlistTime) {
                earlistTime = gacha.publishedAt[server.serverId]
                earlistGacha = gacha
            }
        }
    }
    if (earlistTime == 1 / 0) {
        return null
    }
    return earlistGacha
}

//获取当前进行中的卡池
export function getPresentGachaList(server: Server, start: number = Date.now(), end: number = Date.now()): Gacha[] {
    var gachaList: Array<Gacha> = []
    var gachaListMain = mainAPI['gacha']
    
    for (const gachaId in gachaListMain) {
        if (Object.prototype.hasOwnProperty.call(gachaListMain, gachaId)) {
            const gacha = new Gacha(parseInt(gachaId))
            
            // 检查卡池持续时间是否与start和end有交集





            if (gacha.publishedAt[server.serverId] <= end && gacha.closedAt[server.serverId] >= start) {
                if (gacha.type == 'special') {
                    continue
                }
                if(gacha.gachaName[new Server('jp').serverId]!=null){
                    if(gacha.gachaName[new Server('jp').serverId].includes('初心者限定')){
                        continue
                    }
                }
                gachaList.push(gacha)
            }
        }
    }
    
    return gachaList
}