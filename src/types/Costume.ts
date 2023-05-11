import { callAPIAndCacheResponse } from '../api/getApi';
import { Bestdoriurl } from '../config';
import mainAPI from './_Main';

export class Costume {
    costumeId: number;
    isExist: boolean = false;
    characterId: number;
    assetBundleName: string;
    description: Array<string | null>;
    publishedAt: Array<number | null>;
    constructor(costumeId: number) {
        this.costumeId = costumeId
        const costumeData = mainAPI['costumes'][costumeId.toString()]
        if (costumeData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = costumeData['publishedAt'];
    }
    }
