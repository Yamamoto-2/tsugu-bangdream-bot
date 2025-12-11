/**
 * Costume Service
 * Business logic for costume-related operations
 */

import { Server } from '@/types/Server';
import { Costume } from '@/types/Costume';
import { BestdoriClient } from '@/lib/clients/BestdoriClient';

export class CostumeService {
    private bestdoriClient: BestdoriClient;
    private costumesCache: { [costumeId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all costumes data (cached)
     */
    private async loadAllCostumes(): Promise<{ [costumeId: string]: any }> {
        if (!this.costumesCache) {
            const costumesData = await this.bestdoriClient.getAllCostumes();
            this.costumesCache = costumesData as { [costumeId: string]: any };
        }
        return this.costumesCache;
    }

    /**
     * Get costume by ID
     */
    async getCostumeById(costumeId: number): Promise<Costume | null> {
        try {
            const costumesData = await this.loadAllCostumes();
            const costumeData = costumesData[costumeId.toString()];
            if (!costumeData) {
                return null;
            }

            const costume = new Costume(costumeId, costumeData);
            return costume.isExist ? costume : null;
        } catch (e) {
            console.error('Failed to get costume:', e);
            return null;
        }
    }

    /**
     * Get costume with full data by ID
     */
    async getCostumeFullById(costumeId: number): Promise<Costume | null> {
        try {
            const costume = await this.getCostumeById(costumeId);
            if (!costume || !costume.isExist) {
                return null;
            }

            // Load full data if not already loaded
            if (!costume.isInitfull) {
                const fullCostumeData = await this.bestdoriClient.getCostumeRaw(costumeId);
                costume.initFromFullData(fullCostumeData);
            }

            return costume;
        } catch (e) {
            console.error('Failed to get costume full:', e);
            return null;
        }
    }

    /**
     * Get costumes by character ID
     */
    async getCostumesByCharacterId(characterId: number): Promise<Costume[]> {
        try {
            const costumesData = await this.loadAllCostumes();
            const costumes: Costume[] = [];

            for (const costumeId in costumesData) {
                const costumeData = costumesData[costumeId];
                if (costumeData && costumeData['characterId'] === characterId) {
                    const costume = new Costume(parseInt(costumeId), costumeData);
                    if (costume.isExist) {
                        costumes.push(costume);
                    }
                }
            }

            return costumes;
        } catch (e) {
            console.error('Failed to get costumes by character:', e);
            return [];
        }
    }
}

