/**
 * Bestdori API Client
 * Unified client for all Bestdori API calls
 */

import { callAPIAndCacheResponse } from './getApi';
import { Bestdoriurl, BestdoriapiPath } from '@/config/constants';

export class BestdoriClient {
    private baseUrl: string;
    private cacheRootPath?: string;

    constructor(baseUrl: string = Bestdoriurl, cacheRootPath?: string) {
        this.baseUrl = baseUrl;
        this.cacheRootPath = cacheRootPath;
    }

    /**
     * Call API with caching
     */
    private async callAPI(path: string, cacheTime: number = 0, retryCount: number = 3): Promise<object> {
        const url = `${this.baseUrl}${path}`;
        return await callAPIAndCacheResponse(url, cacheTime, retryCount, this.cacheRootPath);
    }

    /**
     * Get all songs data
     */
    async getAllSongs(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.songs, cacheTime);
    }

    /**
     * Get single song data by ID
     */
    async getSongRaw(songId: number, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/songs/${songId}.json`, cacheTime);
    }

    /**
     * Get all events data
     */
    async getAllEvents(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.events, cacheTime);
    }

    /**
     * Get single event data by ID
     */
    async getEventRaw(eventId: number, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/events/${eventId}.json`, cacheTime);
    }

    /**
     * Get all cards data
     */
    async getAllCards(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.cards, cacheTime);
    }

    /**
     * Get single card data by ID
     */
    async getCardRaw(cardId: number, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/cards/${cardId}.json`, cacheTime);
    }

    /**
     * Get all characters data
     */
    async getAllCharacters(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.characters, cacheTime);
    }

    /**
     * Get single character data by ID
     */
    async getCharacterRaw(characterId: number, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/characters/${characterId}.json`, cacheTime);
    }

    /**
     * Get all gacha data
     */
    async getAllGacha(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.gacha, cacheTime);
    }

    /**
     * Get single gacha data by ID
     */
    async getGachaRaw(gachaId: number, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/gacha/${gachaId}.json`, cacheTime);
    }

    /**
     * Get song chart data
     */
    async getSongChart(songId: number, difficultyName: string, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/charts/${songId}/${difficultyName}.json`, cacheTime);
    }

    /**
     * Get all meta data
     */
    async getAllMeta(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.meta, cacheTime);
    }

    /**
     * Get all skills data
     */
    async getAllSkills(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.skills, cacheTime);
    }

    /**
     * Get single skill data by ID
     */
    async getSkillRaw(skillId: number, cacheTime: number = 0): Promise<object> {
        // Note: Bestdori doesn't have a single skill endpoint, so we get all and filter
        const allSkills = await this.getAllSkills(cacheTime);
        return (allSkills as any)[skillId.toString()] || {};
    }

    /**
     * Get all bands data
     */
    async getAllBands(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.bands, cacheTime);
    }

    /**
     * Get all singer data (bands with icons)
     */
    async getAllSinger(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.singer, cacheTime);
    }

    /**
     * Get all costumes data
     */
    async getAllCostumes(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.costumes, cacheTime);
    }

    /**
     * Get single costume data by ID
     */
    async getCostumeRaw(costumeId: number, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/costumes/${costumeId}.json`, cacheTime);
    }

    /**
     * Get all degrees data
     */
    async getAllDegrees(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.degrees, cacheTime);
    }

    /**
     * Get all area items data
     */
    async getAllAreaItems(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.areaItems, cacheTime);
    }

    /**
     * Get all items data
     */
    async getAllItems(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.items, cacheTime);
    }

    /**
     * Get rates data
     */
    async getRates(cacheTime: number = 0): Promise<object> {
        return await this.callAPI(BestdoriapiPath.rates, cacheTime);
    }

    /**
     * Get cutoff tracker data for an event
     */
    async getCutoffTrackerData(server: number, eventId: number, tier: number, cacheTime: number = 0): Promise<object> {
        return await this.callAPI(`/api/tracker/data?server=${server}&event=${eventId}&tier=${tier}`, cacheTime);
    }
}

/**
 * Default BestdoriClient instance
 */
export const defaultBestdoriClient = new BestdoriClient();

