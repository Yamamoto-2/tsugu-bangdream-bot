import { callAPIAndCacheResponse } from '@/api/getApi';
import mainAPI from '@/types/_Main';
import { Image, loadImage } from 'skia-canvas'
import { downloadFileCache } from '@/api/downloadFileCache'
import { Server, getServerByPriority, serverList } from '@/types/Server';
import { Event, getPresentEvent } from '@/types/Event';
import { globalDefaultServer, Bestdoriurl } from '@/config';

let gachaDataCache = {}

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
        ticketId: number
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
    //用于计算
    pickUpCardId: Array<number>;
    isInitFull = false;

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
    async initFull(useCache: boolean = true) {
        if (this.isInitFull) {
            return
        }
        if (this.isExist == false) {
            return
        }
        let gachaData: object;
        if (gachaDataCache[this.gachaId.toString()] != undefined && !useCache) {
            gachaData = gachaDataCache[this.gachaId.toString()]
        }
        else {
            gachaData = await this.getData(useCache)
            gachaDataCache[this.gachaId.toString()] = gachaData
        }

        this.isExist = true;
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
        //加载pickUpCardId
        this.getGachaPickUpCardId()
        this.isInitFull = true
    }
    async getData(update: boolean = true) {
        var time = update ? 0 : 1 / 0
        const gachaData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/gacha/${this.gachaId}.json`, time)
        return gachaData
    }
    async getBannerImage(): Promise<Image> {
        try {
            var BannerImageBuffer = await downloadFileCache(`${Bestdoriurl}/assets/jp/homebanner_rip/${this.bannerAssetBundleName}.png`, false)
            return await loadImage(BannerImageBuffer)
        }
        catch (e) {
            return (this.getGachaLogo())
        }
    }
    async getGachaBGImage(displayedServerList: Server[] = globalDefaultServer): Promise<Image> {
        if (!displayedServerList) displayedServerList = globalDefaultServer
        var server = getServerByPriority(this.publishedAt)
        let BGImageBuffer: Buffer
        try {
            BGImageBuffer = await downloadFileCache(`${Bestdoriurl}/assets/${Server[server]}/gacha/screen/${this.resourceName}_rip/bg.png`, false)
        }
        catch (e) {
            BGImageBuffer = await downloadFileCache(`${Bestdoriurl}/assets/${Server[server]}/gacha/screen/${this.resourceName}_rip/bg1.png`)
        }
        return await loadImage(BGImageBuffer)
    }
    async getGachaLogo(displayedServerList: Server[] = globalDefaultServer): Promise<Image> {
        if (!displayedServerList) displayedServerList = globalDefaultServer
        var server = getServerByPriority(this.publishedAt)
        var LogoImageBuffer = await downloadFileCache(`${Bestdoriurl}/assets/${Server[server]}/gacha/screen/${this.resourceName}_rip/logo.png`)
        return await loadImage(LogoImageBuffer)
    }
    getEventId() {
        var eventList: Array<number> = []
        for (let i = 0; i < serverList.length; i++) {
            var server = serverList[i]
            var tempEvent = getPresentEvent(server, this.publishedAt[server])
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
    getGachaPickUpCardId() {
        this.pickUpCardId = []
        const server = getServerByPriority(this.publishedAt)
        const details = this.details[server]
        for (const i in details) {
            if (Object.prototype.hasOwnProperty.call(details, i)) {
                const element = details[i];
                if (element['pickup']) {
                    this.pickUpCardId.push(Number(i))
                }
            }
        }
    }
}

//获取当前进行中的卡池
export async function getPresentGachaList(server: Server, start: number = Date.now(), end: number = Date.now()): Promise<Array<Gacha>> {
    var gachaList: Array<Gacha> = []
    var gachaListMain = mainAPI['gacha']

    for (const gachaId in gachaListMain) {
        if (Object.prototype.hasOwnProperty.call(gachaListMain, gachaId)) {
            const gacha = new Gacha(parseInt(gachaId))

            // 检查卡池持续时间是否与start和end有交集
            if (gacha.publishedAt[server] == null) {
                continue
            }
            if (gacha.publishedAt[server] <= end && gacha.closedAt[server] >= start) {
                if (gacha.type == 'free') {
                    continue
                }
                if (gacha.gachaName[Server.jp] != null) {
                    await gacha.initFull(false)
                    if (gacha.gachaPeriod[Server.jp] == '期限なし') {
                        continue
                    }
                }
                gachaList.push(gacha)
            }
        }
    }

    return gachaList
}