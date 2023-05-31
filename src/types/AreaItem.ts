import { callAPIAndCacheResponse } from '../api/getApi';
import { downloadFile } from '../api/downloadFile';
import { Bestdoriurl } from '../config';
import mainAPI from './_Main';
import {getServerByPriority } from './Server';
import { Image, loadImage} from 'canvas';
import { Stat } from './Card';


export class AreaItem {
    areaItemId: number;
    isExist: boolean = false;
    level:Array<number|null>;
    areaItemLevel:number
    areaItemName:Array<string|null>;
    description:{[areaItemLevel:number]:Array<string|null>};
    performance:{[areaItemLevel:number]:Array<string|null>};
    technique:{[areaItemLevel:number]:Array<string|null>};
    visual:{[areaItemLevel:number]:Array<string|null>};
    targetAttributes:Array<'cool' | 'happy' | 'pure' | 'powerful'>;
    targetBandIds:Array<number>;
    constructor(areaItemId: number) {
        this.areaItemId = areaItemId
        const areaItemData = mainAPI['areaItems'][areaItemId.toString()]
        if (areaItemData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.level = areaItemData['level'];
        this.areaItemName = areaItemData['areaItemName'];
        this.description = areaItemData['description'];
        this.performance = areaItemData['performance'];
        this.technique = areaItemData['technique'];
        this.visual = areaItemData['visual'];
        this.targetAttributes = areaItemData['targetAttributes'];
        this.targetBandIds = areaItemData['targetBandIds'];
    }
}