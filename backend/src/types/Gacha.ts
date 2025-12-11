/**
 * Gacha domain type
 * Migrated from backend_old/src/types/Gacha.ts
 * Removed: HTTP calls (getData, initFull HTTP part), rendering methods (getBannerImage, getGachaBGImage, etc.)
 * 
 * Note: Constructor still depends on mainAPI
 * This will be refactored to use BestdoriClient in the future
 */

import { Server, getServerByPriority } from './Server';
import { stringToNumberArray } from '@/lib/utils/number';
import { globalDefaultServer } from '@/config/constants';

const typeName: { [key: string]: string } = {
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
    data!: object;
    resourceName!: string;
    bannerAssetBundleName!: string;
    gachaName!: Array<string | null>;
    publishedAt!: Array<number | null>;
    closedAt!: Array<number | null>;
    type!: string;
    newCards!: Array<number | null>;

    //other
    details!: Array<{
        [cardId: string]: {
            rarityIndex: number,
            weight: number,
            pickUp: boolean
        };
    } | null>;
    rates!: Array<{
        [rarity: string]: {
            rate: number,
            weightTotal: number
        }
    }>
    paymentMethods!: Array<{
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
    description!: Array<string | null>;
    annotation!: Array<string | null>;
    gachaPeriod!: Array<string | null>;
    gachaType!: string;
    information!: {
        description: Array<string | null>,
        term: Array<string | null>,
        newMemberInfo: Array<string | null>,
        notice: Array<string | null>,
    }
    pickUpCardId!: Array<number>;
    isInitFull = false;

    /**
     * Constructor - creates Gacha from gachaId
     * TODO: In the future, gachaData should be provided via BestdoriClient
     */
    constructor(gachaId: number, gachaData?: any) {
        this.gachaId = gachaId
        
        if (!gachaData) {
            this.isExist = false;
            return
        }

        this.isExist = true;
        this.data = gachaData
        this.resourceName = gachaData['resourceName']
        this.bannerAssetBundleName = gachaData['bannerAssetBundleName']
        this.gachaName = gachaData['gachaName']
        this.publishedAt = stringToNumberArray(gachaData['publishedAt'])
        this.closedAt = stringToNumberArray(gachaData['closedAt'])
        this.type = gachaData['type']
        this.newCards = gachaData['newCards']
    }

    /**
     * Initialize full gacha data from provided gachaData
     * This replaces the old initFull() which made HTTP calls
     */
    initFromFullData(gachaData: any): void {
        if (this.isInitFull) {
            return
        }
        if (this.isExist == false) {
            return
        }

        this.isExist = true;
        this.resourceName = gachaData['resourceName'];
        this.bannerAssetBundleName = gachaData['bannerAssetBundleName'];
        this.gachaName = gachaData['gachaName'];
        this.publishedAt = stringToNumberArray(gachaData['publishedAt']);
        this.closedAt = stringToNumberArray(gachaData['closedAt']);
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
        
        // Load pickUpCardId
        this.getGachaPickUpCardId()
        this.isInitFull = true
    }

    /**
     * Get gacha type name
     */
    getTypeName(): string {
        if (typeName[this.type] == undefined) {
            return this.type
        }
        return typeName[this.type]
    }

    /**
     * Get pickup card IDs from details
     * Pure function - no IO
     */
    getGachaPickUpCardId(): void {
        if (!this.isInitFull) {
            throw new Error('Gacha data not fully initialized. Call initFromFullData() first.')
        }
        var pickUpCardId: Array<number> = []
        for (let i = 0; i < this.details.length; i++) {
            const detail = this.details[i]
            if (detail == null) {
                continue
            }
            for (const cardId in detail) {
                if (detail[cardId].pickUp) {
                    pickUpCardId.push(parseInt(cardId))
                }
            }
        }
        this.pickUpCardId = pickUpCardId
    }

    /**
     * Check if gacha is published on server
     */
    isPublished(server: Server): boolean {
        if (this.publishedAt[server] == null) {
            return false
        }
        return true
    }

    /**
     * Get first published server
     */
    getFirstPublishedServer(displayedServerList: Server[] = globalDefaultServer): Server {
        return getServerByPriority(this.publishedAt, displayedServerList) || Server.jp
    }
}

