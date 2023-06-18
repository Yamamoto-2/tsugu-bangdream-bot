import * as path from 'path';

export const projectRoot: string = path.resolve(path.dirname(__dirname));
export const assetsRootPath: string = path.join(projectRoot, '/assets');
export const configPath: string = path.join(projectRoot, '/config');
export const fuzzySearchPath = path.join(configPath, '/fuzzy_search_settings.json');
export const carKeywordPath = path.join(configPath, '/car_keyword.json');
export const cacheRootPath: string = path.join(projectRoot, '/cache');

export const BestdoriapiPath = { //Bestdori网站的列表api路径
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
export const bindingPlayerPromptWaitingTime: number = 5 * 60 * 10000

export const Bestdoriurl: string = 'https://bestdori.com'; //Bestdori网站的url
export const BandoriStationurl: string = 'https://api.bandoristation.com/'; //BandoriStation网站的url

export enum Server {
    jp, en, tw, cn, kr
}


export const globalDefaultServer: Array<Server> = [Server.cn, Server.jp]//默认服务器列表
export const globalServerPriority: Array<Server> = [Server.cn, Server.jp, Server.tw, Server.en, Server.kr]//默认服务器优先级
export const serverNameFullList = [
    '日服',
    '国际服',
    '台服',
    '国服',
    '韩服'
]

export enum BindingStatus {
    None, Verifying, Success, Failed
}

export interface tsuguUser{
    user_id: string,
    platform: string,
    server_mode: Server,
    default_server: Server[],
    car: boolean,
    server_list: {
      gameID: number,
      verifyCode?: number,
      bindingStatus: BindingStatus
    }[]
}

export interface Channel {
    tsugu_gacha: boolean
  }
