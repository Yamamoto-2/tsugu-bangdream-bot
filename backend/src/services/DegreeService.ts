/**
 * Degree Service
 * Business logic for degree-related operations
 */

import { Server } from '@/types/Server';
import { Degree } from '@/types/Degree';
import { BestdoriClient } from '@/lib/clients/BestdoriClient';

export class DegreeService {
    private bestdoriClient: BestdoriClient;
    private degreesCache: { [degreeId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all degrees data (cached)
     */
    private async loadAllDegrees(): Promise<{ [degreeId: string]: any }> {
        if (!this.degreesCache) {
            const degreesData = await this.bestdoriClient.getAllDegrees();
            this.degreesCache = degreesData as { [degreeId: string]: any };
        }
        return this.degreesCache;
    }

    /**
     * Get degree by ID
     */
    async getDegreeById(degreeId: number): Promise<Degree | null> {
        try {
            const degreesData = await this.loadAllDegrees();
            const degreeData = degreesData[degreeId.toString()];
            if (!degreeData) {
                return null;
            }

            const degree = new Degree(degreeId, degreeData);
            return degree.isExist ? degree : null;
        } catch (e) {
            console.error('Failed to get degree:', e);
            return null;
        }
    }

    /**
     * Get multiple degrees by IDs
     */
    async getDegreesByIds(degreeIds: number[]): Promise<Degree[]> {
        try {
            const degreesData = await this.loadAllDegrees();
            const degrees: Degree[] = [];

            for (const degreeId of degreeIds) {
                const degreeData = degreesData[degreeId.toString()];
                if (degreeData) {
                    const degree = new Degree(degreeId, degreeData);
                    if (degree.isExist) {
                        degrees.push(degree);
                    }
                }
            }

            return degrees;
        } catch (e) {
            console.error('Failed to get degrees by IDs:', e);
            return [];
        }
    }

    /**
     * Get degrees from event rewards
     * Extracts degree IDs from event ranking rewards and music ranking rewards
     */
    getDegreesFromEventRewards(event: any, server: Server): number[] {
        const degreeIds: number[] = [];

        // Extract from ranking rewards
        if (event.rankingRewards && event.rankingRewards[server]) {
            const rankingRewards = event.rankingRewards[server];
            for (let i = 0; i < rankingRewards.length; i++) {
                if (rankingRewards[i].rewardType === 'degree') {
                    degreeIds.push(rankingRewards[i].rewardId);
                }
            }
        }

        // Extract from music ranking rewards (for versus/challenge/medley events)
        if (event.musics && event.musics[server]) {
            const musics = event.musics[server];
            for (let i = 0; i < musics.length; i++) {
                if (musics[i].musicRankingRewards) {
                    for (let n = 0; n < musics[i].musicRankingRewards.length; n++) {
                        if (musics[i].musicRankingRewards[n].resourceType === 'degree') {
                            degreeIds.push(musics[i].musicRankingRewards[n].resourceId);
                        }
                    }
                }
            }
        }

        return degreeIds;
    }
}

