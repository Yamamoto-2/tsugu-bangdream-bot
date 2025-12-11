/**
 * Item Service
 * Business logic for item-related operations
 */

import { Server } from '@/types/Server';
import { Item } from '@/types/Item';
import { BestdoriClient } from '@/api/BestdoriClient';

export class ItemService {
    private bestdoriClient: BestdoriClient;
    private itemsCache: { [itemId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all items data (cached)
     */
    private async loadAllItems(): Promise<{ [itemId: string]: any }> {
        if (!this.itemsCache) {
            const itemsData = await this.bestdoriClient.getAllItems();
            this.itemsCache = itemsData as { [itemId: string]: any };
        }
        return this.itemsCache;
    }

    /**
     * Get item by ID
     * Supports special items: 'paid_star', 'free_star'
     */
    async getItemById(itemId: string): Promise<Item | null> {
        try {
            // Special handling for star items (no API call needed)
            if (itemId === 'paid_star' || itemId === 'free_star') {
                return new Item(itemId);
            }

            const itemsData = await this.loadAllItems();
            const itemData = itemsData[itemId];
            if (!itemData) {
                return null;
            }

            const item = new Item(itemId, itemData);
            return item.isExist ? item : null;
        } catch (e) {
            console.error('Failed to get item:', e);
            return null;
        }
    }

    /**
     * Get multiple items by IDs
     */
    async getItemsByIds(itemIds: string[]): Promise<Item[]> {
        try {
            const items: Item[] = [];

            for (const itemId of itemIds) {
                const item = await this.getItemById(itemId);
                if (item && item.isExist) {
                    items.push(item);
                }
            }

            return items;
        } catch (e) {
            console.error('Failed to get items by IDs:', e);
            return [];
        }
    }

    /**
     * Get items from gacha payment methods
     * Extracts item IDs from gacha payment methods
     */
    getItemsFromGachaPaymentMethods(gacha: any, server: Server): string[] {
        const itemIds: string[] = [];

        if (!gacha.paymentMethods || !gacha.paymentMethods[server]) {
            return itemIds;
        }

        const paymentMethods = gacha.paymentMethods[server];
        for (let i = 0; i < paymentMethods.length; i++) {
            const paymentMethod = paymentMethods[i];
            let itemId = '';

            if (paymentMethod.paymentMethod === 'free_star' || paymentMethod.paymentMethod === 'paid_star') {
                itemId = paymentMethod.paymentMethod;
            } else if (paymentMethod.ticketId !== undefined) {
                itemId = 'gacha_ticket_' + paymentMethod.ticketId;
            }

            if (itemId && !itemIds.includes(itemId)) {
                itemIds.push(itemId);
            }
        }

        return itemIds;
    }
}
