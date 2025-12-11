/**
 * Band Service
 * Business logic for band-related operations
 */

import { Server } from '@/types/Server';
import { Band } from '@/types/Band';
import { Character } from '@/types/Character';
import { BestdoriClient } from '@/api/BestdoriClient';
import { CharacterService } from './CharacterService';

export class BandService {
    private bestdoriClient: BestdoriClient;
    private characterService: CharacterService;
    private bandsCache: { [bandId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient, characterService?: CharacterService) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
        this.characterService = characterService || new CharacterService(bestdoriClient);
    }

    /**
     * Load all bands data (cached)
     */
    private async loadAllBands(): Promise<{ [bandId: string]: any }> {
        if (!this.bandsCache) {
            const bandsData = await this.bestdoriClient.getAllBands();
            this.bandsCache = bandsData as { [bandId: string]: any };
        }
        return this.bandsCache;
    }

    /**
     * Get band by ID
     */
    async getBandById(bandId: number): Promise<Band | null> {
        try {
            const bandsData = await this.loadAllBands();
            const bandData = bandsData[bandId.toString()];
            if (!bandData) {
                return null;
            }

            // Build character band ID map for member lookup
            const characterBandIdMap = await this.characterService.buildCharacterBandIdMap();
            
            // Get band members (characters in this band)
            const members = await this.characterService.getCharactersByBandId(bandId);
            
            const band = new Band(bandId, bandData, characterBandIdMap);
            
            // Set members if band exists
            if (band.isExist) {
                // Create members array matching the order in bandData
                const membersArray: Array<Character | null> = [];
                const memberIds = bandData['members'] || [];
                
                // Create a map for quick lookup
                const membersMap = new Map<number, Character>();
                members.forEach(char => {
                    if (char && char.isExist) {
                        membersMap.set(char.characterId, char);
                    }
                });
                
                // Build members array in the order specified by bandData
                for (let i = 0; i < memberIds.length; i++) {
                    const characterId = memberIds[i];
                    const member = membersMap.get(characterId);
                    membersArray.push(member || null);
                }
                
                band.setMembers(membersArray);
            }

            return band.isExist ? band : null;
        } catch (e) {
            console.error('Failed to get band:', e);
            return null;
        }
    }

    /**
     * Get all bands
     */
    async getAllBands(): Promise<Band[]> {
        try {
            const bandsData = await this.loadAllBands();
            const characterBandIdMap = await this.characterService.buildCharacterBandIdMap();
            const bands: Band[] = [];

            for (const bandId in bandsData) {
                const bandData = bandsData[bandId];
                const band = new Band(parseInt(bandId), bandData, characterBandIdMap);
                if (band.isExist) {
                    bands.push(band);
                }
            }

            return bands;
        } catch (e) {
            console.error('Failed to get all bands:', e);
            return [];
        }
    }
}
