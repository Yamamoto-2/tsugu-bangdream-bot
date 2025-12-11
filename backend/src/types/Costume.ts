/**
 * Costume domain type
 * Migrated from backend_old/src/types/Costume.ts
 * Removed: HTTP calls (initFull HTTP part), rendering methods (getSdchara)
 * 
 * Note: Constructor still depends on mainAPI
 * This will be refactored to use BestdoriClient in the future
 */

import { Server, getServerByPriority } from './Server';
import { stringToNumberArray } from '@/lib/utils/number';
import { globalDefaultServer } from '@/config/constants';

export class Costume {
    costumeId: number;
    isExist: boolean = false;
    characterId!: number;
    assetBundleName!: string;
    description!: Array<string | null>;
    publishedAt!: Array<number | null>;
    data!: object;
    cards!: Array<number>;
    sdResourceName!: string;
    isInitfull: boolean = false;

    /**
     * Constructor - creates Costume from costumeId
     * TODO: In the future, costumeData should be provided via BestdoriClient
     */
    constructor(costumeId: number, costumeData?: any) {
        this.costumeId = costumeId;
        
        if (!costumeData) {
            this.isExist = false;
            return;
        }

        this.isExist = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = stringToNumberArray(costumeData['publishedAt']);
        this.data = costumeData;
    }

    /**
     * Initialize full costume data from provided costumeData
     * This replaces the old initFull() which made HTTP calls
     */
    initFromFullData(costumeData: any): void {
        if (this.isInitfull) {
            return;
        }

        if (this.isExist == false) {
            return;
        }

        this.isInitfull = true;
        this.data = costumeData;
        this.isExist = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = stringToNumberArray(costumeData['publishedAt']);
        this.cards = costumeData['cards'];
        this.sdResourceName = costumeData['sdResourceName'];
    }

    /**
     * Get SD character image URL (pure function, no HTTP calls)
     */
    getSdcharaURL(displayedServerList: Server[] = globalDefaultServer, bestdoriUrl?: string): string {
        const Bestdoriurl = bestdoriUrl || 'https://bestdori.com';
        const server = getServerByPriority(this.publishedAt, displayedServerList) || Server.jp;
        return `${Bestdoriurl}/assets/${Server[server]}/characters/livesd/${this.sdResourceName}_rip/sdchara.png`;
    }

    /**
     * Check if costume is published on server
     */
    isPublished(server: Server): boolean {
        return this.publishedAt[server] != null;
    }

    /**
     * Get first published server
     */
    getFirstPublishedServer(displayedServerList: Server[] = globalDefaultServer): Server {
        return getServerByPriority(this.publishedAt, displayedServerList) || Server.jp;
    }
}

