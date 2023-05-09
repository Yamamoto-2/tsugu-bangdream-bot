import * as path from 'path';

export const projectRoot: string = path.resolve(path.dirname(__dirname));
export const assetsRootPath: string = path.join(projectRoot, '/assets');

export const cacheRootPath: string = path.join(projectRoot, '/cache');
export const BestdoriapiPath = { //Bestdori网站的列表api路径
    'cards': '/api/cards/all.5.json',
    'characters': '/api/characters/main.3.json',
    'bands': '/api/bands/main.1.json',
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
    'rates': '/api/tracker/rates.json'
}

export const Bestdoriurl: string = 'https://bestdori.com'; //Bestdori网站的url

