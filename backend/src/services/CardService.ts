/**
 * Card Service
 * Business logic for card-related operations
 * Extracted from backend_old routers and types
 */

import { Server } from '@/types/Server';
import { Card } from '@/types/Card';
import { BestdoriClient } from '@/api/BestdoriClient';
import { fuzzySearch, FuzzySearchResult, match } from '@/utils/fuzzySearch';
import { fuzzySearchPath } from '@/config/runtime';
import * as fs from 'fs';

export class CardService {
    private bestdoriClient: BestdoriClient;
    private cardsCache: { [cardId: string]: any } | null = null;
    private charactersCache: { [characterId: string]: any } | null = null;
    private skillsCache: { [skillId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all cards data (cached)
     */
    private async loadAllCards(): Promise<{ [cardId: string]: any }> {
        if (!this.cardsCache) {
            const cardsData = await this.bestdoriClient.getAllCards();
            this.cardsCache = cardsData as { [cardId: string]: any };
        }
        return this.cardsCache;
    }

    /**
     * Load all characters data and build bandId map (cached)
     */
    private async loadCharacterBandIdMap(): Promise<Map<number, number>> {
        if (!this.charactersCache) {
            const charactersData = await this.bestdoriClient.getAllCharacters();
            this.charactersCache = charactersData as { [characterId: string]: any };
        }

        const bandIdMap = new Map<number, number>();
        for (const characterId in this.charactersCache) {
            const characterData = this.charactersCache[characterId];
            if (characterData && characterData['bandId'] != null) {
                bandIdMap.set(parseInt(characterId), characterData['bandId']);
            }
        }
        return bandIdMap;
    }

    /**
     * Load all skills data (cached)
     */
    private async loadAllSkills(): Promise<{ [skillId: string]: any }> {
        if (!this.skillsCache) {
            const skillsData = await this.bestdoriClient.getAllSkills();
            this.skillsCache = skillsData as { [skillId: string]: any };
        }
        return this.skillsCache;
    }

    /**
     * Get card by ID
     */
    async getCardById(cardId: number): Promise<Card | null> {
        try {
            const cardsData = await this.loadAllCards();
            const cardData = cardsData[cardId.toString()];
            if (!cardData) {
                return null;
            }

            const characterBandIdMap = await this.loadCharacterBandIdMap();
            const skillsData = await this.loadAllSkills();
            const skillData = skillsData[cardData['skillId']?.toString()];
            
            // Extract skill effect types and score up max value
            const skillEffectTypes = skillData ? this.extractSkillEffectTypes(skillData) : undefined;
            const skillScoreUpMaxValue = skillData ? this.extractSkillScoreUpMaxValue(skillData) : undefined;
            
            const characterBandId = characterBandIdMap.get(cardData['characterId']);
            const card = new Card(cardId, cardData, characterBandId, skillEffectTypes, skillScoreUpMaxValue);
            return card.isExist ? card : null;
        } catch (e) {
            console.error('Failed to get card:', e);
            return null;
        }
    }

    /**
     * Get card with full data by ID
     */
    async getCardFullById(cardId: number): Promise<Card | null> {
        try {
            const card = await this.getCardById(cardId);
            if (!card || !card.isExist) {
                return null;
            }

            // Load full card data if not already loaded
            if (!card.isInitFull) {
                const fullCardData = await this.bestdoriClient.getCardRaw(cardId);
                card.initFromFullData(fullCardData);
            }

            return card;
        } catch (e) {
            console.error('Failed to get card full:', e);
            return null;
        }
    }

    /**
     * Search cards by keyword using fuzzy search
     */
    async searchCards(keyword: string, displayedServerList: Server[]): Promise<Card[]> {
        try {
            const fuzzySearchConfig = JSON.parse(fs.readFileSync(fuzzySearchPath, 'utf-8'));
            const fuzzySearchResult = fuzzySearch(keyword, fuzzySearchConfig);
            
            const cardsData = await this.loadAllCards();
            const characterBandIdMap = await this.loadCharacterBandIdMap();
            const skillsData = await this.loadAllSkills();
            const matchedCards: Card[] = [];

            for (const cardId in cardsData) {
                const cardData = cardsData[cardId];
                const skillData = skillsData[cardData['skillId']?.toString()];
                
                const skillEffectTypes = skillData ? this.extractSkillEffectTypes(skillData) : undefined;
                const skillScoreUpMaxValue = skillData ? this.extractSkillScoreUpMaxValue(skillData) : undefined;
                
                const characterBandId = characterBandIdMap.get(cardData['characterId']);
                const card = new Card(parseInt(cardId), cardData, characterBandId, skillEffectTypes, skillScoreUpMaxValue);
                
                if (!card.isExist) {
                    continue;
                }

                // Check if card matches fuzzy search criteria
                if (this.matchesFuzzySearch(card, fuzzySearchResult, displayedServerList)) {
                    matchedCards.push(card);
                }
            }

            return matchedCards;
        } catch (e) {
            console.error('Failed to search cards:', e);
            return [];
        }
    }

    /**
     * Check if card matches fuzzy search criteria
     */
    private matchesFuzzySearch(card: Card, fuzzyResult: FuzzySearchResult, displayedServerList: Server[]): boolean {
        // Basic match using fuzzy search utils
        const numberTypeKeys = ['cardId', 'characterId', 'bandId', 'rarity'];
        let basicMatch = match(fuzzyResult, card, numberTypeKeys);

        // Check if card is released in displayed servers
        if (displayedServerList && displayedServerList.length > 0) {
            const isReleased = displayedServerList.some(server => 
                card.releasedAt[server] != null
            );
            if (!isReleased) {
                return false;
            }
        }

        return basicMatch;
    }

    /**
     * Extract skill effect types from skill data
     */
    private extractSkillEffectTypes(skillData: any): string[] {
        const skillTypeList = [
            'judge', 'life', 'damage', 'score', 'score_perfect', 
            'score_continued_note_judge', 'score_over_life', 'score_under_great_half'
        ];

        const tempTypeList: string[] = [];
        
        if (skillData.activationEffect) {
            for (const key in skillData.activationEffect.activateEffectTypes) {
                if (key === 'score') {
                    tempTypeList.push(key);
                    if (skillData.activationEffect.activateEffectTypes['score']?.activateCondition === 'perfect') {
                        tempTypeList.push('score_perfect');
                    }
                } else if (key.includes('score')) {
                    tempTypeList.push('score');
                    tempTypeList.push(key);
                } else {
                    tempTypeList.push(key);
                }
            }
        }
        
        if (skillData.onceEffect) {
            tempTypeList.push(skillData.onceEffect.onceEffectType);
        }
        
        const uniqueTypes = Array.from(new Set(tempTypeList));
        uniqueTypes.sort((a, b) => {
            return skillTypeList.indexOf(a) - skillTypeList.indexOf(b);
        });
        
        return uniqueTypes.length > 0 ? uniqueTypes : ['score'];
    }

    /**
     * Extract skill score up max value from skill data
     */
    private extractSkillScoreUpMaxValue(skillData: any): number {
        if (!skillData.activationEffect) {
            return 0;
        }

        const numbers: number[] = [];
        
        if (skillData.activationEffect.unificationActivateEffectValue !== undefined) {
            numbers.push(skillData.activationEffect.unificationActivateEffectValue);
        }
        
        for (const key in skillData.activationEffect.activateEffectTypes) {
            const effectType = skillData.activationEffect.activateEffectTypes[key];
            if (effectType.activateEffectValue) {
                effectType.activateEffectValue.forEach((value: number | null) => {
                    if (value != null) {
                        numbers.push(value);
                    }
                });
            }
        }
        
        return numbers.length > 0 ? Math.max(...numbers) : 0;
    }
}
