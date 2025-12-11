/**
 * Item domain type
 * Migrated from backend_old/src/types/Item.ts
 * Removed: HTTP calls, rendering methods (getItemImage)
 * 
 * Note: Constructor still depends on mainAPI
 * This will be refactored to use BestdoriClient in the future
 */

import { Server, getServerByPriority } from './Server';
import { formatNumber } from '@/lib/utils/number';
import { globalDefaultServer, Bestdoriurl } from '@/config/constants';

const typeNameList: { [key: string]: string } = {
    'item_': 'material',
    'live_boost_recovery_item_': 'boostdrink',
    'practice_ticket_': 'practiceTicket',
    'skill_practice': 'skillticket',
    'gacha_ticket_': 'gachaTicket',
    'miracle_ticket_': 'miracleTicket',
}

export class Item {
    name!: Array<string | null>;
    resourceId!: number;
    itemId!: string;
    type!: string;
    typeName!: string;
    isExist: boolean = false;

    /**
     * Constructor - creates Item from itemId
     * TODO: In the future, itemData should be provided via BestdoriClient
     */
    constructor(itemId: string, itemData?: any) {
        // Special handling for star items
        if (itemId == 'paid_star' || itemId == 'free_star') {
            if (itemId == 'paid_star') {
                this.name = ['有料スター', 'paid star', 'paid star', '付费星石', 'paid star'];
            } else {
                this.name = ['無料スター', 'free star', 'free star', '免费星石', 'free star'];
            }
            this.resourceId = 0;
            this.type = 'star';
            this.isExist = true;
            this.typeName = 'star';
            this.itemId = itemId;
            return;
        }

        // For other items
        if (!itemData) {
            this.isExist = false;
            return;
        }

        this.isExist = true;
        this.itemId = itemId;
        this.name = itemData['name'];
        this.resourceId = itemData['resourceId'];
        
        // Determine typeName from itemId prefix
        for (const prefix in typeNameList) {
            if (this.itemId.startsWith(prefix)) {
                this.typeName = typeNameList[prefix];
                break;
            }
        }
    }

    /**
     * Get item image URL (pure function, no HTTP calls)
     */
    getItemImageURL(server?: Server, displayedServerList: Server[] = globalDefaultServer, bestdoriUrl?: string): string {
        const Bestdoriurl = bestdoriUrl || 'https://bestdori.com';
        
        if (server == undefined) {
            server = getServerByPriority(this.name, displayedServerList) || Server.jp;
        }

        if (this.typeName == 'material') {
            return `${Bestdoriurl}/assets/${Server[server]}/thumb/material_rip/${this.typeName}${formatNumber(this.resourceId, 3)}.png`;
        } else if (this.typeName == 'star') {
            return `${Bestdoriurl}/assets/${Server[server]}/thumb/common_rip/star.png`;
        } else {
            return `${Bestdoriurl}/assets/${Server[server]}/thumb/common_rip/${this.typeName}${this.resourceId}.png`;
        }
    }

    /**
     * Check if item is available on server
     */
    isAvailable(server: Server): boolean {
        return this.name[server] != null;
    }

    /**
     * Get first available server
     */
    getFirstAvailableServer(displayedServerList: Server[] = globalDefaultServer): Server {
        return getServerByPriority(this.name, displayedServerList) || Server.jp;
    }
}

