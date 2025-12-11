/**
 * Gacha Service
 * Business logic for gacha-related operations
 * Extracted from backend_old routers and types
 */

import { Server, getServerByPriority } from '@/types/Server';
import { BestdoriClient } from '@/api/BestdoriClient';
import { Gacha } from '@/types/Gacha';
import { Card } from '@/types/Card';

export interface GachaSimulateResult {
    cards: Array<{
        cardId: number;
        count: number;
    }>;
}

export class GachaService {
    private bestdoriClient: BestdoriClient;
    private gachaCache: { [gachaId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all gacha data (cached)
     */
    private async loadAllGacha(): Promise<{ [gachaId: string]: any }> {
        if (!this.gachaCache) {
            const gachaData = await this.bestdoriClient.getAllGacha();
            this.gachaCache = gachaData as { [gachaId: string]: any };
        }
        return this.gachaCache;
    }

    /**
     * Get gacha by ID
     */
    async getGachaById(gachaId: number): Promise<Gacha | null> {
        try {
            const gachaData = await this.loadAllGacha();
            const gachaRaw = gachaData[gachaId.toString()];
            if (!gachaRaw) {
                return null;
            }

            const gacha = new Gacha(gachaId, gachaRaw);
            if (!gacha.isExist) {
                return null;
            }

            // Load full gacha data
            const fullGachaData = await this.bestdoriClient.getGachaRaw(gachaId);
            gacha.initFromFullData(fullGachaData);
            
            return gacha.isExist ? gacha : null;
        } catch (e) {
            console.error('Failed to get gacha:', e);
            return null;
        }
    }

    /**
     * Get present gacha list for a server
     */
    async getPresentGachaList(server: Server, start: number = Date.now(), end: number = Date.now()): Promise<Gacha[]> {
        try {
            const gachaData = await this.loadAllGacha();
            const gachaList: Gacha[] = [];

            for (const gachaId in gachaData) {
                const gachaRaw = gachaData[gachaId];
                const gacha = new Gacha(parseInt(gachaId), gachaRaw);

                if (!gacha.isExist) {
                    continue;
                }

                // Check if gacha is active in time range
                if (gacha.publishedAt[server] == null) {
                    continue;
                }

                const publishedAt = gacha.publishedAt[server];
                const closedAt = gacha.closedAt[server];

                if (publishedAt != null && closedAt != null) {
                    // Check if gacha period overlaps with time range
                    if (publishedAt <= end && closedAt >= start) {
                        // Skip free gacha
                        if (gacha.type == 'free') {
                            continue;
                        }

                        // Load full data to check gachaPeriod
                        const fullGachaData = await this.bestdoriClient.getGachaRaw(parseInt(gachaId));
                        gacha.initFromFullData(fullGachaData);

                        // Skip if period is unlimited (期限なし)
                        if (gacha.gachaPeriod && gacha.gachaPeriod[Server.jp] == '期限なし') {
                            continue;
                        }

                        gachaList.push(gacha);
                    }
                }
            }

            return gachaList;
        } catch (e) {
            console.error('Failed to get present gacha list:', e);
            return [];
        }
    }

    /**
     * Simulate gacha draws
     */
    async simulateGacha(gachaId: number, times: number = 10): Promise<GachaSimulateResult> {
        if (times > 10000) {
            throw new Error('抽卡次数过多, 请不要超过10000次');
        }

        const gacha = await this.getGachaById(gachaId);
        if (!gacha || !gacha.isExist) {
            throw new Error('该卡池不存在');
        }

        // Ensure full data is loaded
        if (!gacha.isInitFull) {
            const fullGachaData = await this.bestdoriClient.getGachaRaw(gachaId);
            gacha.initFromFullData(fullGachaData);
        }

        const server = getServerByPriority(gacha.publishedAt);
        if (server === undefined) {
            throw new Error('无法确定卡池服务器');
        }
        const gachaDetails = gacha.details[server];
        const gachaRates = gacha.rates[server];

        const cardCounts: { [cardId: number]: number } = {};

        // Simulate draws
        for (let i = 0; i < times; i++) {
            let cardRarity = parseInt(this.getRandomRarity(gachaRates));
            
            // 10th draw guarantee (保底)
            if (i % 10 == 9 && cardRarity < 3) {
                cardRarity = 3;
            }

            const rarityTotalWeight = gachaRates[cardRarity.toString()].weightTotal;
            if (!gachaDetails) {
                continue;
            }
            const cardId = this.getCardByWeight(cardRarity, rarityTotalWeight, gachaDetails);
            
            if (cardId) {
                const cardIdNum = parseInt(cardId);
                cardCounts[cardIdNum] = (cardCounts[cardIdNum] || 0) + 1;
            }
        }

        // Convert to array format and load card data for sorting
        const cardsWithRarity = await Promise.all(
            Object.keys(cardCounts).map(async (cardId) => {
                const cardIdNum = parseInt(cardId);
                // Load card data to get rarity for sorting
                const cardRaw = await this.bestdoriClient.getCardRaw(cardIdNum);
                const card = new Card(cardIdNum, cardRaw);
                return {
                    cardId: cardIdNum,
                    count: cardCounts[cardIdNum],
                    rarity: card.isExist ? card.rarity : 0
                };
            })
        );

        // Sort by rarity (descending)
        cardsWithRarity.sort((a, b) => b.rarity - a.rarity);

        // Return without rarity field
        const cards = cardsWithRarity.map(({ rarity, ...rest }) => rest);

        return { cards };
    }

    /**
     * Get random card by weight within a rarity
     */
    private getCardByWeight(rarity: number, totalWeight: number, cardWeightList: { [cardId: string]: { rarityIndex: number, weight: number, pickUp: boolean } }): string | null {
        const randomNum = Math.random() * totalWeight;
        let currentWeight = 0;

        for (const cardId in cardWeightList) {
            if (cardWeightList.hasOwnProperty(cardId)) {
                const card = cardWeightList[cardId];
                if (card.rarityIndex !== rarity) {
                    continue;
                }
                currentWeight += card.weight;
                if (randomNum < currentWeight) {
                    return cardId;
                }
            }
        }

        return null;
    }

    /**
     * Get random rarity based on rates
     */
    private getRandomRarity(rarities: { [rarity: string]: { rate: number, weightTotal: number } }): string {
        let totalRate = 0;
        for (const key in rarities) {
            if (rarities.hasOwnProperty(key)) {
                totalRate += rarities[key].rate;
            }
        }

        const randomNum = Math.random() * totalRate;
        let currentRate = 0;

        for (const key in rarities) {
            if (rarities.hasOwnProperty(key)) {
                const rarity = rarities[key];
                currentRate += rarity.rate;
                if (randomNum < currentRate) {
                    return key;
                }
            }
        }

        // Fallback to highest rarity
        return Object.keys(rarities)[Object.keys(rarities).length - 1];
    }
}

