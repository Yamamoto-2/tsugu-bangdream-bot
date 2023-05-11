import { callAPIAndCacheResponse } from '../api/getApi';
import mainAPI from './_Main';
import {Server} from './Server';

export class Gacha {
    gachaId:number;
    isExist = false
    data:object;
    resourceName: string;
    bannerAssetBundleName: string;
    gachaName: Array<string | null>;
    publishedAt: Array<number | null>;
    closedAt: Array<number | null>;
    type:string;
    newCards: Array<number | null>;

    //other
    details: Array<{
        [cardId:string] :{
            rarityIndex:number,
            weight:number,
            pickUp:boolean
        };
    } | null>;
    rates: Array<{
        [rarity:string]:{
            rate:number,
            weightTotal:number
        }
    }>
    paymentMethods: Array<{
        gachaId:number,
        paymentType:string,
        quantity:number,
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
    gachaPeriod:Array<string | null>;
    gachaType:string;
    information:{
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
    async initFull(){
        if (mainAPI['gacha'][this.gachaId.toString()] == undefined) {
            this.isExist = false;
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
        this.rates =  gachaData['rates'];
        this.paymentMethods = gachaData['paymentMethods'];
        this.description = gachaData['description'];
        this.annotation = gachaData['annotation'];
        this.gachaPeriod = gachaData['gachaPeriod'];
        this.gachaType = gachaData['gachaType'];
        this.information = gachaData['information'];
    }
    async getData(){
        const gachaData = await callAPIAndCacheResponse(`https://bestdori.com/api/gacha/${this.gachaId}.json`)
        return gachaData
    }
    
}