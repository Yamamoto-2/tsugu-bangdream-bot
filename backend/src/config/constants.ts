/**
 * Business constants - API URLs, server lists, tier lists, etc.
 * Migrated from backend_old/src/config.ts (business constant parts)
 */

import { Server } from '@/types/Server';

/**
 * Bestdori website URL
 */
export const Bestdoriurl: string = 'https://bestdori.com';

/**
 * BandoriStation website URL
 */
export const BandoriStationurl: string = 'https://api.bandoristation.com/';

/**
 * Bestdori API paths
 */
export const BestdoriapiPath = {
    'cards': '/api/cards/all.5.json',
    'characters': '/api/characters/main.3.json',
    'bands': '/api/bands/main.1.json',
    'singer': '/api/bands/all.1.json',
    'skills': '/api/skills/all.10.json',
    'costumes': '/api/costumes/all.5.json',
    'events': '/api/events/all.6.json',
    'degrees': '/api/degrees/all.3.json',
    'gacha': '/api/gacha/all.5.json',
    'songs': '/api/songs/all.7.json',
    'meta': '/api/songs/meta/all.5.json',
    'loginCampaigns': '/api/loginCampaigns/all.5.json',
    'miracleTicketExchanges': '/api/miracleTicketExchanges/all.5.json',
    'comics': '/api/comics/all.5.json',
    'areaItems': '/api/areaItems/main.5.json',
    'rates': '/api/tracker/rates.json',
    'items': '/api/misc/itemtexts.2.json'
}

/**
 * Binding player prompt waiting time (milliseconds)
 */
export const bindingPlayerPromptWaitingTime: number = 5 * 60 * 10000;

/**
 * Default server list
 */
export const globalDefaultServer: Array<Server> = [Server.cn, Server.jp];

/**
 * Server priority list (for fallback)
 */
export const globalServerPriority: Array<Server> = [Server.cn, Server.jp, Server.tw, Server.en, Server.kr];

/**
 * Full server name list (Chinese)
 */
export const serverNameFullList = [
    '日服',
    '国际服',
    '台服',
    '国服',
    '韩服'
]

/**
 * Tier list for each server
 */
export const tierListOfServer = {
    'jp': [20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000, 20000, 30000, 50000],
    'tw': [100, 500],
    'en': [50, 100, 300, 500, 1000, 2000, 2500],
    'kr': [100],
    'cn': [20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 2000, 3000, 4000, 5000, 10000, 20000, 30000, 50000]
}

/**
 * Status name mapping
 */
export const statusName = {
    'not_start': '未开始',
    'in_progress': '进行中',
    'ended': '已结束'
}

