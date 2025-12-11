/**
 * Cutoff domain type
 * Migrated from backend_old/src/types/Cutoff.ts
 * Removed: HTTP calls (initFull), kept pure calculation methods (predict, getChartData)
 * 
 * Note: predict() logic will be moved to CutoffService
 */

import { Server } from './Server';
import { Event } from './Event';

export interface CutoffDataPoint {
    time: number;
    ep: number;
}

export class Cutoff {
    eventId: number;
    server: Server;
    tier: number;
    isExist = false;
    cutoffs!: CutoffDataPoint[];
    eventType!: string;
    latestCutoff!: CutoffDataPoint;
    rate!: number | null;
    predictEP!: number;
    startAt!: number;
    endAt!: number;
    status!: 'not_start' | 'in_progress' | 'ended';
    isInitfull: boolean = false;

    /**
     * Constructor - creates Cutoff from eventId, server, tier
     * TODO: eventData should be provided via EventService
     */
    constructor(eventId: number, server: Server, tier: number, event?: Event, tierList?: number[]) {
        this.eventId = eventId;
        this.server = server;
        this.tier = tier;

        if (!event || !event.isExist) {
            this.isExist = false;
            return;
        }

        // Check if tier exists in server's tier list
        if (tierList && !tierList.includes(tier)) {
            this.isExist = false;
            return;
        }

        this.isExist = true;
        this.eventType = event.eventType;
        this.startAt = event.startAt[server] || 0;
        this.endAt = event.endAt[server] || 0;

        // Calculate status
        const time = Date.now();
        if (this.startAt && time < this.startAt) {
            this.status = 'not_start';
        } else if (this.endAt && time > this.endAt) {
            this.status = 'ended';
        } else {
            this.status = 'in_progress';
        }
    }

    /**
     * Initialize from cutoff data
     * This replaces the old initFull() which made HTTP calls
     */
    initFromData(
        cutoffData: { cutoffs: CutoffDataPoint[], result: boolean },
        rate: number | null
    ): void {
        if (this.isInitfull) {
            return;
        }
        if (this.isExist == false) {
            return;
        }

        if (!cutoffData || cutoffData.result === false) {
            this.isExist = false;
            return;
        }

        this.isExist = true;
        this.cutoffs = cutoffData.cutoffs || [];
        
        if (this.cutoffs.length == 0) {
            this.latestCutoff = { time: this.startAt, ep: 0 };
        } else {
            this.latestCutoff = this.cutoffs[this.cutoffs.length - 1];
        }

        this.rate = rate;

        // Note: predict() will be called by CutoffService, not here
        this.isInitfull = true;
    }

    /**
     * Get chart data for visualization
     * Pure function - no IO
     */
    getChartData(setStartToZero = false): { x: Date, y: number }[] {
        if (this.isExist == false) {
            return [];
        }
        
        let chartData: { x: Date, y: number }[] = [];
        if (setStartToZero) {
            chartData.push({ x: new Date(0), y: 0 });
        } else {
            chartData.push({ x: new Date(this.startAt), y: 0 });
        }

        let tempTime = this.cutoffs && this.cutoffs.length > 0 ? this.cutoffs[0].time : null;

        for (let i = 0; i < this.cutoffs.length; i++) {
            const element = this.cutoffs[i];
            if (setStartToZero) {
                chartData.push({ 
                    x: tempTime ? new Date(element.time - this.startAt) : new Date(0), 
                    y: element.ep 
                });
            } else {
                chartData.push({ x: new Date(element.time), y: element.ep });
            }
            tempTime = element.time;
        }
        return chartData;
    }
}
