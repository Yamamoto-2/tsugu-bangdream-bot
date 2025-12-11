/**
 * AreaItem domain type
 * Migrated from backend_old/src/types/AreaItem.ts
 * Pure data structure - no HTTP calls or rendering
 */

import { Server } from './Server';
import { Card, Stat } from './Card';

export class AreaItem {
    areaItemId: number;
    isExist: boolean = false;
    level!: Array<number | null>;
    areaItemLevel!: number
    areaItemName!: Array<string | null>;
    description!: { [areaItemLevel: number]: Array<string | null> };
    performance!: { [areaItemLevel: number]: Array<string | null> };
    technique!: { [areaItemLevel: number]: Array<string | null> };
    visual!: { [areaItemLevel: number]: Array<string | null> };
    targetAttributes!: Array<'cool' | 'happy' | 'pure' | 'powerful'>;
    targetBandIds!: Array<number>;
    
    /**
     * Constructor - creates AreaItem from areaItemId
     * TODO: In the future, areaItemData should be provided via BestdoriClient
     */
    constructor(areaItemId: number, areaItemData?: any) {
        this.areaItemId = areaItemId
        
        if (!areaItemData) {
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
    
    /**
     * Calculate stat bonus from area item
     * Pure calculation function - no IO
     */
    calcStat(card: Card, areaItemLevel: number, cardStat: Stat, server: Server): Stat {
        var emptyStat: Stat = {
            performance: 0,
            technique: 0,
            visual: 0
        }
        
        if (!this.isExist) {
            return emptyStat
        }
        
        if (this.targetAttributes.includes(card.attribute) && this.targetBandIds.includes(card.bandId)) {
            const perfValue = this.performance[areaItemLevel]?.[server];
            const techValue = this.technique[areaItemLevel]?.[server];
            const visValue = this.visual[areaItemLevel]?.[server];
            
            if (perfValue == null || techValue == null || visValue == null) {
                return emptyStat;
            }
            
            var finalStat: Stat = {
                performance: parseFloat(perfValue as string) * cardStat.performance / 100,
                technique: parseFloat(techValue as string) * cardStat.technique / 100,
                visual: parseFloat(visValue as string) * cardStat.visual / 100
            }
            return finalStat
        }
        else {
            return emptyStat
        }
    }
}
