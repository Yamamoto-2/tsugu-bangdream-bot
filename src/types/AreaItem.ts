import { callAPIAndCacheResponse } from '../api/getApi';
import { downloadFile } from '../api/downloadFile';
import { Bestdoriurl } from '../config';
import mainAPI from './_Main';
import {Server, getServerByPriority } from './Server';
import { Image, loadImage} from 'canvas';
import { Card, Stat } from './Card';


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
    calcStat(card:Card,areaItemLevel:number,cardSTat:Stat,server:Server):Stat{
        var emptyStat:Stat = {//空综合力变量
            performance:0,
            technique:0,
            visual:0
        }
        if(this.targetAttributes.includes(card.attribute) && this.targetBandIds.includes(card.bandId)){
            var finalStat = {
                performance: server.getContentByServer(this.performance[areaItemLevel])*cardSTat.performance/100,
                technique:server.getContentByServer(this.technique[areaItemLevel])*cardSTat.technique/100,
                visual:server.getContentByServer(this.visual[areaItemLevel])*cardSTat.visual/100
            }
            return finalStat
        }
        else{
            return emptyStat
        }
    }

}