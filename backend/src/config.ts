import * as path from 'path';
import { Server } from '@/types/Server';
import { logger } from './logger';

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
    'items': '/api/misc/itemtexts.2.json',
    'deco': '/api/deco/pins.all.3.json'
}
export const bindingPlayerPromptWaitingTime: number = 5 * 60 * 10000

export const Bestdoriurl: string = 'https://bestdori.com'; //Bestdori网站的url
export const BandoriStationurl: string = 'https://api.bandoristation.com/'; //BandoriStation网站的url

export const HHWX_Url: string = 'https://hhwx.org'; //HHWX网站的url
export var USE_HHWX_SOURCE_PREFER = false;   // 是否优先使用HHWX的Tracker数据

const enableAutoTrackerDataSourceSwitch = true  // 是否开启数据源优先自动切换
const trackerAutoSwitchThreshold:number = 5     // 设定数据源自动切换门限，当存在5次数据源更新不及时的情况，自动切换数据源，加快访问速度
var trackerAutoSwitchFlags:number = 0
export function reportDataSourceProblem(){
    if(enableAutoTrackerDataSourceSwitch){
        if(++trackerAutoSwitchFlags > trackerAutoSwitchThreshold-1){
            USE_HHWX_SOURCE_PREFER = !USE_HHWX_SOURCE_PREFER
            logger('config.ts/reportDataSourceProblem',`Tracker数据源多次出现问题，将数据源优先切换至${USE_HHWX_SOURCE_PREFER?"HHWX":"Bestdori"}`)
            trackerAutoSwitchFlags = 0
        }
    }
}
export function clearDataSourceProblem(){
    trackerAutoSwitchFlags = 0
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
    'cn': [20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 4000, 5000, 10000, 20000, 30000, 50000]
}

export const statusName = {
    'not_start': '未开始',
    'in_progress': '进行中',
    'ended': '已结束'
}