/**
 * Player Service
 * Business logic for player-related operations
 * Extracted from backend_old types/Player.ts
 */

import { Server } from '@/types/Server';
import { Player } from '@/types/Player';
import { Event } from '@/types/Event';
import { Card, Stat, addStat } from '@/types/Card';
import { AreaItem } from '@/types/AreaItem';
import { BestdoriClient } from '@/api/BestdoriClient';

export class PlayerService {
    private bestdoriClient: BestdoriClient;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Get player by ID and server
     * Note: Bestdori doesn't have a public player API endpoint
     * This would need to be implemented via a proxy or user-provided data
     */
    async getPlayerById(playerId: number, server: Server, playerData?: any): Promise<Player | null> {
        try {
            // If playerData is provided, use it directly
            if (playerData) {
                const player = new Player(playerId, server, playerData);
                return player.isExist ? player : null;
            }

            // TODO: Implement player data fetching via proxy or user-provided endpoint
            // For now, return null if no data provided
            return null;
        } catch (e) {
            console.error('Failed to get player:', e);
            return null;
        }
    }

    /**
     * Calculate player deck stat
     * Extracted from Player.calcStat
     */
    async calcPlayerStat(player: Player, event?: Event): Promise<Stat> {
        if (player.profile.publishTotalDeckPowerFlg == false) {
            return {
                performance: 0,
                technique: 0,
                visual: 0,
            };
        }

        // Calculate card stats
        const cardDataList = player.profile.mainDeckUserSituations.entries;
        const cardStatList: Stat[] = [];
        const cardStat: Stat = {
            performance: 0,
            technique: 0,
            visual: 0,
        };

        // Load card data for each card in deck
        const cardsCache: { [cardId: number]: Card } = {};
        const cardsDataCache: { [cardId: number]: any } = {};

        for (let i = 0; i < cardDataList.length; i++) {
            const cardData = cardDataList[i];
            const cardId = cardData.situationId;

            // Load card data if not cached
            if (!cardsCache[cardId]) {
                const cardRaw = await this.bestdoriClient.getCardRaw(cardId);
                const card = new Card(cardId, cardRaw);
                
                // Initialize full card data
                if (!card.isInitFull) {
                    card.initFromFullData(cardRaw);
                }
                
                cardsCache[cardId] = card;
                cardsDataCache[cardId] = cardRaw;
            }

            const card = cardsCache[cardId];
            const tempStat = card.calcStat(cardData);
            addStat(cardStat, tempStat);
            cardStatList.push(tempStat);
        }

        // Calculate area item bonuses
        const extraStat: Stat = {
            performance: 0,
            technique: 0,
            visual: 0,
        };

        const areaItemList = player.profile.enabledUserAreaItems.entries;
        const areaItemsCache: { [areaItemId: number]: AreaItem } = {};

        for (let i = 0; i < areaItemList.length; i++) {
            const element = areaItemList[i];
            const areaItemId = element.areaItemId;

            // Load area item data if not cached
            if (!areaItemsCache[areaItemId]) {
                const areaItemRaw = await this.bestdoriClient.getAllAreaItems();
                const areaItemData = (areaItemRaw as any)[areaItemId.toString()];
                if (areaItemData) {
                    const areaItem = new AreaItem(areaItemId, areaItemData);
                    areaItemsCache[areaItemId] = areaItem;
                }
            }

            const areaItem = areaItemsCache[areaItemId];
            if (!areaItem || !areaItem.isExist) {
                continue;
            }

            const areaItemLevel = element.level;

            // Apply area item bonus to each card
            for (let j = 0; j < cardStatList.length; j++) {
                const cardStat = cardStatList[j];
                const card = cardsCache[cardDataList[j].situationId];
                if (card && card.isExist) {
                    const tempStat = areaItem.calcStat(card, areaItemLevel, cardStat, player.server);
                    addStat(extraStat, tempStat);
                }
            }
        }

        // Calculate event bonuses
        const eventStat: Stat = {
            performance: 0,
            technique: 0,
            visual: 0,
        };

        if (event && event.isExist) {
            for (let i = 0; i < cardStatList.length; i++) {
                const cardStat = cardStatList[i];
                const card = cardsCache[cardDataList[i].situationId];
                if (!card || !card.isExist) {
                    continue;
                }

                let isCharacter = false;
                let isAttribute = false;

                // Check character bonus
                for (let j = 0; j < event.characters.length; j++) {
                    const characterPercent = event.characters[j];
                    if (card.characterId == characterPercent.characterId) {
                        const tempStat = {
                            performance: cardStat.performance * characterPercent.percent / 100,
                            technique: cardStat.technique * characterPercent.percent / 100,
                            visual: cardStat.visual * characterPercent.percent / 100,
                        };
                        addStat(eventStat, tempStat);
                        isCharacter = true;
                        break;
                    }
                }

                // Check attribute bonus
                for (let j = 0; j < event.attributes.length; j++) {
                    const attributePercent = event.attributes[j];
                    if (card.attribute == attributePercent.attribute) {
                        const tempStat = {
                            performance: cardStat.performance * attributePercent.percent / 100,
                            technique: cardStat.technique * attributePercent.percent / 100,
                            visual: cardStat.visual * attributePercent.percent / 100,
                        };
                        addStat(eventStat, tempStat);
                        isAttribute = true;
                        break;
                    }
                }

                // Check combined character + attribute bonus
                if (isCharacter && isAttribute && event.eventAttributeAndCharacterBonus) {
                    if (event.eventAttributeAndCharacterBonus.parameterPercent != 0) {
                        const tempStat = {
                            performance: cardStat.performance * event.eventAttributeAndCharacterBonus.parameterPercent / 100,
                            technique: cardStat.technique * event.eventAttributeAndCharacterBonus.parameterPercent / 100,
                            visual: cardStat.visual * event.eventAttributeAndCharacterBonus.parameterPercent / 100,
                        };
                        addStat(eventStat, tempStat);
                    }
                }
            }

            addStat(extraStat, eventStat);
        }

        // Add all bonuses to base card stat
        addStat(cardStat, extraStat);

        return cardStat;
    }
}
