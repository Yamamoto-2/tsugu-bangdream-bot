import mainAPI from '@/types/_Main';
import { Server } from '@/types/Server';
import { Card, Stat } from '@/types/Card';


export class AreaItem {
    areaItemId: number;
    isExist: boolean = false;
    level: Array<number | null>;
    areaItemLevel: number
    areaItemName: Array<string | null>;
    description: { [areaItemLevel: number]: Array<string | null> };
    performance: { [areaItemLevel: number]: Array<string | null> };
    technique: { [areaItemLevel: number]: Array<string | null> };
    visual: { [areaItemLevel: number]: Array<string | null> };
    targetAttributes: Array<'cool' | 'happy' | 'pure' | 'powerful'>;
    targetBandIds: Array<number>;
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
    calcStat(card: Card, areaItemLevel: number, cardSTat: Stat, server: Server): Stat {
        var emptyStat: Stat = {//空综合力变量
            performance: 0,
            technique: 0,
            visual: 0
        }
        if (!this.isExist) {
            return emptyStat
        }
        if (this.targetAttributes.includes(card.attribute) && this.targetBandIds.includes(card.bandId)) {
            var finalStat = {
                performance: this.performance[areaItemLevel.toString()][server] * cardSTat.performance / 100,
                technique: this.technique[areaItemLevel.toString()][server] * cardSTat.technique / 100,
                visual: this.visual[areaItemLevel.toString()][server] * cardSTat.visual / 100
            }
            return finalStat
        }
        else {
            return emptyStat
        }
    }

}