import * as path from 'path';

export const projectRoot: string = path.resolve(path.dirname(__dirname));
export const assetsRootPath: string = path.join(projectRoot, '/assets');
export const configPath: string = path.join(projectRoot, '/config');
export const carKeywordPath = path.join(configPath, '/car_keyword.json');
export const cacheRootPath: string = path.join(projectRoot, '/cache');

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

export const tierListOfServer = {
    'jp': [20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000, 20000, 30000, 50000],
    'tw': [100, 500],
    'en': [50, 100, 300, 500, 1000, 2000, 2500],
    'kr': [100],
    'cn': [50, 100, 300, 500, 1000, 2000]
}

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
