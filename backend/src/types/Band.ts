/**
 * Band domain type
 * Migrated from backend_old/src/types/Band.ts
 * Removed: HTTP calls, rendering methods (getIcon, getLogo)
 * 
 * Note: Constructor still depends on mainAPI and Character type
 * This will be refactored to use BestdoriClient in the future
 */

import { Character } from './Character';

export class Band {
    bandId: number;
    isExist: boolean = false;
    data!: object;
    bandName!: Array<string | null>;
    members!: Array<Character | null>;
    hasIcon: boolean = false;

    /**
     * Constructor - creates Band from bandId
     * TODO: In the future, bandData and characterBandIdMap should be provided via BestdoriClient
     */
    constructor(bandId: number, bandData?: any, characterBandIdMap?: Map<number, number>) {
        this.bandId = bandId
        
        if (!bandData) {
            this.isExist = false;
            return
        }

        this.isExist = true;
        this.data = bandData
        this.bandName = bandData['bandName']
        
        // TODO: getMembers() logic should be handled by service layer
        // For now, we keep the structure but mark as TODO
        this.members = []
    }

    /**
     * Set band members
     * This should be called by service layer after loading character data
     */
    setMembers(members: Array<Character | null>): void {
        this.members = members;
    }
}

