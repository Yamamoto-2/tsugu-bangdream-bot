import * as path from 'path';

export const projectRoot: string = path.resolve(path.dirname(__dirname));
export const assetsRootPath: string = path.join(projectRoot, '/assets');
export const configPath: string = path.join(projectRoot, '/config');
export const fuzzySearchPath = path.join(configPath, '/fuzzy_search_settings.json');
export const carKeywordPath = path.join(configPath, '/card_keyword.json');

export const cacheRootPath: string = path.join(projectRoot, '/cache');
export const BestdoriapiPath = { //Bestdori网站的列表api路径
    'cards': '/api/cards/all.5.json',
    'characters': '/api/characters/main.3.json',
    'bands': '/api/bands/main.1.json',
    'singer':'/api/bands/all.1.json',
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
    'items':'/api/misc/itemtexts.2.json'
}

export const Bestdoriurl: string = 'https://bestdori.com'; //Bestdori网站的url

export const defaultserver: Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['cn', 'jp']

export const EazyBG = true //是否使用简易背景，这将大幅提高速度

export const serverPriority: Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['cn', 'jp', 'tw', 'en', 'kr']
