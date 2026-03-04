/**
 * DataManager — 全局数据管理器
 * 启动时加载 Bestdori 数据，定期刷新
 * 所有 Service 层使用同一份内存数据
 */

import { defaultBestdoriClient } from './clients/BestdoriClient';
import { logger } from './logger';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 分钟

interface DataStore {
  events: { [id: string]: any } | null;
  cards: { [id: string]: any } | null;
  characters: { [id: string]: any } | null;
  songs: { [id: string]: any } | null;
  gacha: { [id: string]: any } | null;
  skills: { [id: string]: any } | null;
  bands: { [id: string]: any } | null;
  meta: { [id: string]: any } | null;
}

const store: DataStore = {
  events: null,
  cards: null,
  characters: null,
  songs: null,
  gacha: null,
  skills: null,
  bands: null,
  meta: null,
};

let initialized = false;

/**
 * 加载所有数据
 * @param useCache - 为 true 时使用无限缓存(启动快速加载)，为 false 时强制刷新
 */
async function loadAll(useCache: boolean = false): Promise<void> {
  const cacheTime = useCache ? Infinity : 0;
  const label = useCache ? 'cached' : 'fresh';

  const loaders: Array<{ key: keyof DataStore; fn: () => Promise<object> }> = [
    { key: 'events', fn: () => defaultBestdoriClient.getAllEvents(cacheTime) },
    { key: 'cards', fn: () => defaultBestdoriClient.getAllCards(cacheTime) },
    { key: 'characters', fn: () => defaultBestdoriClient.getAllCharacters(cacheTime) },
    { key: 'songs', fn: () => defaultBestdoriClient.getAllSongs(cacheTime) },
    { key: 'gacha', fn: () => defaultBestdoriClient.getAllGacha(cacheTime) },
    { key: 'skills', fn: () => defaultBestdoriClient.getAllSkills(cacheTime) },
    { key: 'bands', fn: () => defaultBestdoriClient.getAllBands(cacheTime) },
    { key: 'meta', fn: () => defaultBestdoriClient.getAllMeta(cacheTime) },
  ];

  const results = await Promise.allSettled(
    loaders.map(async ({ key, fn }) => {
      try {
        const data = await fn();
        store[key] = data as any;
      } catch (e: any) {
        logger('DataManager', `Failed to load ${key} (${label}): ${e.message}`);
        // 失败时保留旧数据
      }
    })
  );

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  logger('DataManager', `Loaded ${successCount}/${loaders.length} datasets (${label})`);
}

/**
 * 初始化: 先用缓存快速加载，再后台刷新最新数据，然后每5分钟刷新
 */
export async function initDataManager(): Promise<void> {
  if (initialized) return;
  initialized = true;

  // 第一步: 用缓存快速启动
  await loadAll(true);

  // 第二步: 后台拉取最新数据
  loadAll(false).catch(() => {});

  // 第三步: 定期刷新
  setInterval(() => {
    loadAll(false).catch(() => {});
  }, REFRESH_INTERVAL);
}

/**
 * 获取数据 (如果未初始化则按需加载)
 */
export function getData(): DataStore {
  return store;
}

export async function getEvents(): Promise<{ [id: string]: any }> {
  if (!store.events) {
    store.events = await defaultBestdoriClient.getAllEvents() as any;
  }
  return store.events!;
}

export async function getCards(): Promise<{ [id: string]: any }> {
  if (!store.cards) {
    store.cards = await defaultBestdoriClient.getAllCards() as any;
  }
  return store.cards!;
}

export async function getCharacters(): Promise<{ [id: string]: any }> {
  if (!store.characters) {
    store.characters = await defaultBestdoriClient.getAllCharacters() as any;
  }
  return store.characters!;
}

export async function getSongs(): Promise<{ [id: string]: any }> {
  if (!store.songs) {
    store.songs = await defaultBestdoriClient.getAllSongs() as any;
  }
  return store.songs!;
}

export async function getGacha(): Promise<{ [id: string]: any }> {
  if (!store.gacha) {
    store.gacha = await defaultBestdoriClient.getAllGacha() as any;
  }
  return store.gacha!;
}

export async function getSkills(): Promise<{ [id: string]: any }> {
  if (!store.skills) {
    store.skills = await defaultBestdoriClient.getAllSkills() as any;
  }
  return store.skills!;
}

export async function getBands(): Promise<{ [id: string]: any }> {
  if (!store.bands) {
    store.bands = await defaultBestdoriClient.getAllBands() as any;
  }
  return store.bands!;
}

export async function getMeta(): Promise<{ [id: string]: any }> {
  if (!store.meta) {
    store.meta = await defaultBestdoriClient.getAllMeta() as any;
  }
  return store.meta!;
}
