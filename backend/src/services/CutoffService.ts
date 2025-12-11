/**
 * Cutoff Service
 * Business logic for cutoff/ranking-related operations
 * 
 * Includes prediction calculation logic extracted from cutoff.cjs
 */

import { Server } from '@/types/Server';
import { Cutoff, CutoffDataPoint } from '@/types/Cutoff';
import { Event } from '@/types/Event';
import { BestdoriClient } from '@/api/BestdoriClient';
import { tierListOfServer } from '@/config/constants';

export interface CutoffDetail {
    eventId: number;
    tier: number;
    server: Server;
    cutoffs: CutoffDataPoint[];
    latestCutoff: CutoffDataPoint;
    rate: number | null;
    predictEP: number;
    startAt: number;
    endAt: number;
    status: 'not_start' | 'in_progress' | 'ended';
}

interface RegressionResult {
    a: number;
    b: number;
}

/**
 * Linear regression calculation
 * Extracted from cutoff.cjs
 */
function regression(data: Array<{ percent: number, ep: number }>): RegressionResult {
    let sumperc = 0, sumep = 0;
    for (let i = 0; i < data.length; i++) {
        sumperc += data[i].percent;
        sumep += data[i].ep;
    }
    const avg_percentage = sumperc / data.length;
    const avg_pt = sumep / data.length;
    let z = 0, w = 0;
    for (let i = 0; i < data.length; i++) {
        z += (data[i].percent - avg_percentage) * (data[i].ep - avg_pt);
        w += (data[i].percent - avg_percentage) * (data[i].percent - avg_percentage);
    }
    const b = z / w;
    const a = avg_pt - b * avg_percentage;
    return { a, b };
}

/**
 * Predict final cutoff EP
 * Extracted from cutoff.cjs
 */
function predictCutoff(
    cutoff: CutoffDataPoint[],
    start_ts: number,
    end_ts: number,
    rate: number | null
): { time: number, ep: number } {
    if (cutoff.length <= 5) {
        return { ep: 0, time: cutoff.length > 0 ? cutoff[cutoff.length - 1].time : 0 };
    }
    
    const data: Array<{ percent: number, ep: number }> = [];
    for (let i = 0; i < cutoff.length; i++) {
        // Skip data points less than 12 hours from start or less than 24 hours from end
        if (cutoff[i].time - start_ts < 43200 || end_ts - cutoff[i].time < 86400) {
            continue;
        }
        const percent = (cutoff[i].time - start_ts) / (end_ts - start_ts);
        data.push({ percent, ep: cutoff[i].ep });
    }
    
    if (data.length === 0) {
        return { ep: 0, time: cutoff.length > 0 ? cutoff[cutoff.length - 1].time : 0 };
    }
    
    const temp = regression(data);
    const rateValue = rate || 0;
    let reg = temp.a + temp.b * (1 + rateValue);
    if (isNaN(reg)) {
        reg = 0;
    }
    return {
        time: cutoff[cutoff.length - 1].time,
        ep: reg
    };
}

export class CutoffService {
    private bestdoriClient: BestdoriClient;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Get cutoff data from Bestdori tracker API
     */
    async getCutoffData(eventId: number, server: Server, tier: number, cacheTime: number = 0): Promise<{ cutoffs: CutoffDataPoint[], result: boolean } | null> {
        try {
            const data = await this.bestdoriClient.getCutoffTrackerData(server, eventId, tier, cacheTime);
            return data as { cutoffs: CutoffDataPoint[], result: boolean };
        } catch (e) {
            console.error('Failed to fetch cutoff data:', e);
            return null;
        }
    }

    /**
     * Get rate for event type and tier
     */
    async getRate(eventType: string, server: Server, tier: number): Promise<number | null> {
        try {
            const ratesData = await this.bestdoriClient.getRates();
            const rateDataList = (ratesData as any)['rates'] as Array<{ server: number, type: string, tier: number, rate: number }>;
            const rateData = rateDataList?.find((element) => {
                return element.server == server && element.type == eventType && element.tier == tier;
            });
            return rateData?.rate || null;
        } catch (e) {
            console.error('Failed to fetch rate:', e);
            return null;
        }
    }

    /**
     * Get cutoff detail for a specific tier
     */
    async getCutoffDetail(eventId: number, tier: number, mainServer: Server, event?: Event): Promise<CutoffDetail | null> {
        // Validate tier exists in server's tier list
        const tierList = tierListOfServer[Server[mainServer] as keyof typeof tierListOfServer];
        if (!tierList || !tierList.includes(tier)) {
            return null;
        }

        // Get event if not provided
        if (!event) {
            // TODO: Get event from EventService
            return null;
        }

        // Create Cutoff domain object
        const cutoff = new Cutoff(eventId, mainServer, tier, event, tierList);
        if (!cutoff.isExist) {
            return null;
        }

        // Fetch cutoff data
        const time = Date.now();
        const cacheTime = time < cutoff.endAt + 1000 * 60 * 60 * 24 * 2 ? 0 : Infinity;
        const cutoffData = await this.getCutoffData(eventId, mainServer, tier, cacheTime);
        
        if (!cutoffData) {
            return null;
        }

        // Get rate
        const rate = await this.getRate(cutoff.eventType, mainServer, tier);

        // Initialize cutoff with data
        cutoff.initFromData(cutoffData, rate);

        if (!cutoff.isExist) {
            return null;
        }

        // Calculate prediction if in progress
        let predictEP = 0;
        if (cutoff.status === 'in_progress' && cutoff.cutoffs.length > 0) {
            const start_ts = Math.floor(cutoff.startAt / 1000);
            const end_ts = Math.floor(cutoff.endAt / 1000);
            const cutoff_ts: CutoffDataPoint[] = cutoff.cutoffs.map(c => ({
                time: Math.floor(c.time / 1000),
                ep: c.ep
            }));
            
            try {
                const result = predictCutoff(cutoff_ts, start_ts, end_ts, cutoff.rate);
                predictEP = Math.floor(result.ep);
            } catch (e) {
                console.error('Prediction failed:', e);
                predictEP = 0;
            }
        }

        return {
            eventId: cutoff.eventId,
            tier: cutoff.tier,
            server: cutoff.server,
            cutoffs: cutoff.cutoffs,
            latestCutoff: cutoff.latestCutoff,
            rate: cutoff.rate,
            predictEP,
            startAt: cutoff.startAt,
            endAt: cutoff.endAt,
            status: cutoff.status
        };
    }

    /**
     * Get all cutoff details for an event
     */
    async getAllCutoffDetails(eventId: number, mainServer: Server, event?: Event): Promise<CutoffDetail[]> {
        const tierList = tierListOfServer[Server[mainServer] as keyof typeof tierListOfServer];
        if (!tierList) {
            return [];
        }

        const results: CutoffDetail[] = [];
        for (const tier of tierList) {
            const detail = await this.getCutoffDetail(eventId, tier, mainServer, event);
            if (detail) {
                results.push(detail);
            }
        }
        return results;
    }

    /**
     * Calculate hourly rate (pt/h) from cutoff data
     * Pure calculation function
     */
    calculateHourlyRate(cutoffs: CutoffDataPoint[], startAt: number): number {
        if (cutoffs.length <= 1) {
            return 0;
        }
        const lastEp = cutoffs[cutoffs.length - 1].ep;
        const secondLastEp = cutoffs.length > 1 ? cutoffs[cutoffs.length - 2].ep : 0;
        const timeSpan = (cutoffs.length > 1 
            ? cutoffs[cutoffs.length - 1].time - cutoffs[cutoffs.length - 2].time 
            : cutoffs[cutoffs.length - 1].time - startAt) / (1000 * 3600);
        
        if (timeSpan <= 0) {
            return 0;
        }
        return Math.round((lastEp - secondLastEp) / timeSpan);
    }
}
