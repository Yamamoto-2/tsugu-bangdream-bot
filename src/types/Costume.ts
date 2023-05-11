import { callAPIAndCacheResponse } from '../api/getApi';
import { Bestdoriurl } from '../config';
import mainAPI from './_Main';

export class Costume {
    costumeId: number;
    isExit: boolean = false;
    characterId: number;
    assetBundleName: string;
    description: Array<string | null>;
    publishedAt: Array<number | null>;
    constructor(costumeId: number) {
        this.costumeId = costumeId
        const costumeData = mainAPI['costumes'][costumeId.toString()]
        if (costumeData == undefined) {
            this.isExit = false;
            return
        }
        this.isExit = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = costumeData['publishedAt'];
    }
    }
