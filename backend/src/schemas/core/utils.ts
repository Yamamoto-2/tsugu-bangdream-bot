/**
 * Schema 构建工具函数
 */

// ========== 基础配置 ==========

export const BESTDORI_URL = 'https://bestdori.com';

// ========== 数字格式化 ==========

/**
 * 格式化数字为指定位数的字符串
 */
export function formatNumber(num: number, digits: number): string {
  return num.toString().padStart(digits, '0');
}

// ========== 卡牌图片 URL ==========

/**
 * 计算卡牌 RIP 目录
 * 每 50 张卡为一组
 */
export function getCardRip(cardId: number): string {
  if (cardId >= 9999) {
    return '200_rip';
  }
  const ripNumber = Math.floor(cardId / 50);
  return `${formatNumber(ripNumber, 3)}_rip`;
}

/**
 * 获取卡牌缩略图 URL
 * @param resourceSetName - 卡牌资源集名称 (如 "res000001")
 * @param cardId - 卡牌 ID (用于计算 rip 目录)
 * @param trained - 是否特训后
 * @param server - 服务器
 */
export function getCardIconUrl(
  resourceSetName: string,
  cardId: number,
  trained: boolean = false,
  server: string = 'jp'
): string {
  const status = trained ? '_after_training' : '_normal';
  const rip = getCardRip(cardId);
  return `${BESTDORI_URL}/assets/${server}/thumb/chara/card00${rip}/${resourceSetName}${status}.png`;
}

/**
 * 获取卡牌插画 URL
 */
export function getCardIllustrationUrl(
  resourceSetName: string,
  trained: boolean = false,
  server: string = 'jp'
): string {
  const status = trained ? '_after_training' : '_normal';
  return `${BESTDORI_URL}/assets/${server}/characters/resourceset/${resourceSetName}_rip/card${status}.png`;
}

/**
 * 获取卡牌框架 URL
 */
export function getCardFrameUrl(rarity: number, attribute?: string): string {
  if (rarity === 1 && attribute) {
    return `${BESTDORI_URL}/res/image/card-1-${attribute}.png`;
  }
  return `${BESTDORI_URL}/res/image/card-${rarity}.png`;
}

/**
 * 获取星星图标 URL
 */
export function getStarUrl(type: 'normal' | 'trained' = 'normal'): string {
  return `${BESTDORI_URL}/res/image/star-${type === 'trained' ? 'after_training' : 'normal'}.png`;
}

// ========== 活动图片 URL ==========

/**
 * 获取活动 Banner URL
 * @param assetBundleName - 活动资源包名称 (如 "ev000")
 */
export function getEventBannerUrl(assetBundleName: string, server: string = 'jp'): string {
  return `${BESTDORI_URL}/assets/${server}/event/${assetBundleName}/images_rip/banner.png`;
}

/**
 * 获取活动 Banner URL (备用 - 使用 bannerAssetBundleName)
 */
export function getEventBannerUrlFallback(bannerAssetBundleName: string): string {
  return `${BESTDORI_URL}/assets/jp/homebanner_rip/${bannerAssetBundleName}.png`;
}

/**
 * 获取活动背景 URL
 */
export function getEventBgUrl(assetBundleName: string, server: string = 'jp'): string {
  return `${BESTDORI_URL}/assets/${server}/event/${assetBundleName}/topscreen_rip/bg_eventtop.png`;
}

/**
 * 获取活动 Logo URL
 */
export function getEventLogoUrl(assetBundleName: string, server: string = 'jp'): string {
  return `${BESTDORI_URL}/assets/${server}/event/${assetBundleName}/images_rip/logo.png`;
}

// ========== 角色图片 URL ==========

/**
 * 获取角色头像 URL
 */
export function getCharacterIconUrl(characterId: number): string {
  return `${BESTDORI_URL}/res/icon/chara_icon_${characterId}.png`;
}

/**
 * 获取角色插画 URL
 */
export function getCharacterIllustrationUrl(characterId: number): string {
  return `${BESTDORI_URL}/assets/jp/ui/character_kv_image/${formatNumber(characterId, 3)}_rip/image.png`;
}

// ========== 属性图片 URL ==========

/**
 * 获取属性图标 URL (SVG)
 */
export function getAttributeIconUrl(attribute: string): string {
  return `${BESTDORI_URL}/res/icon/${attribute}.svg`;
}

// ========== 乐队图片 URL ==========

/**
 * 获取乐队图标 URL (SVG)
 */
export function getBandIconUrl(bandId: number): string {
  return `${BESTDORI_URL}/res/icon/band_${bandId}.svg`;
}

/**
 * 获取乐队 Logo URL
 */
export function getBandLogoUrl(bandId: number): string {
  return `${BESTDORI_URL}/assets/jp/band/logo/${formatNumber(bandId, 3)}_rip/logoL.png`;
}

// ========== 歌曲图片 URL ==========

/**
 * 获取歌曲封面 URL
 */
export function getSongJacketUrl(jacketImage: string[], server: string = 'jp'): string {
  const jacket = jacketImage[0] || jacketImage.find(j => j);
  if (!jacket) return '';
  return `${BESTDORI_URL}/assets/${server}/musicjacket/${jacket}_rip/jacket.png`;
}

// ========== 技能图标 URL ==========

/**
 * 获取技能图标 URL
 */
export function getSkillIconUrl(skillType: string): string {
  return `${BESTDORI_URL}/res/icon/skill_${skillType}.svg`;
}

// ========== 时间格式化 ==========

/**
 * 格式化时间戳为字符串
 */
export function formatTimestamp(timestamp: number, format: 'date' | 'datetime' | 'relative' = 'datetime'): string {
  const date = new Date(timestamp);

  if (format === 'date') {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  if (format === 'datetime') {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // relative
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff < 60 * 1000) return '即将开始';
    if (absDiff < 60 * 60 * 1000) return `${Math.floor(absDiff / 60000)} 分钟后`;
    if (absDiff < 24 * 60 * 60 * 1000) return `${Math.floor(absDiff / 3600000)} 小时后`;
    return `${Math.floor(absDiff / 86400000)} 天后`;
  }

  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 30 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)} 天前`;
  return formatTimestamp(timestamp, 'date');
}

/**
 * 格式化活动剩余时间
 */
export function formatEventRemaining(endAt: number): string {
  const now = Date.now();
  const remaining = endAt - now;

  if (remaining <= 0) return '已结束';

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);

  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}

/**
 * 获取活动进度百分比
 */
export function getEventProgress(startAt: number, endAt: number): number {
  const now = Date.now();
  if (now < startAt) return 0;
  if (now > endAt) return 100;
  return Math.round((now - startAt) / (endAt - startAt) * 100);
}

// ========== 数值格式化 ==========

/**
 * 格式化大数字
 */
export function formatLargeNumber(num: number): string {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toLocaleString('zh-CN');
}

// ========== 服务器相关 ==========

export const SERVER_NAMES: Record<string, string> = {
  'jp': '日服',
  'en': '国际服',
  'tw': '台服',
  'cn': '国服',
  'kr': '韩服'
};

export function getServerName(server: string): string {
  return SERVER_NAMES[server] || server.toUpperCase();
}

// 服务器枚举值到字符串的映射
export function getServerKey(serverIndex: number): string {
  const keys = ['jp', 'en', 'tw', 'cn', 'kr'];
  return keys[serverIndex] || 'jp';
}

// ========== 活动类型 ==========

export const EVENT_TYPE_NAMES: Record<string, string> = {
  'story': '普通活动',
  'versus': 'VS Live',
  'live_try': 'Live Try',
  'challenge': '挑战Live',
  'mission_live': 'Mission Live',
  'festival': '团队Live',
  'medley': '组曲Live'
};

export function getEventTypeName(eventType: string): string {
  return EVENT_TYPE_NAMES[eventType] || eventType;
}

// ========== 属性相关 ==========

export const ATTRIBUTE_NAMES: Record<string, string> = {
  'powerful': 'Powerful',
  'cool': 'Cool',
  'pure': 'Pure',
  'happy': 'Happy'
};

export const ATTRIBUTE_COLORS: Record<string, string> = {
  'powerful': '#ff2d54',
  'cool': '#4057e3',
  'pure': '#44c527',
  'happy': '#ff8400'
};

// ========== 乐队相关 ==========

export const BAND_NAMES: Record<number, string> = {
  1: "Poppin'Party",
  2: 'Afterglow',
  3: 'Pastel*Palettes',
  4: 'Roselia',
  5: 'Hello, Happy World!',
  18: 'RAISE A SUILEN',
  21: 'Morfonica',
  45: 'MyGO!!!!!'
};

export function getBandName(bandId: number): string {
  return BAND_NAMES[bandId] || `Band ${bandId}`;
}

// ========== 难度相关 ==========

export const DIFFICULTY_NAMES = ['Easy', 'Normal', 'Hard', 'Expert', 'Special'];

export const DIFFICULTY_COLORS: Record<number, string> = {
  0: '#5ac8fa',
  1: '#4cd964',
  2: '#ffcc00',
  3: '#ff3b30',
  4: '#af52de'
};

export function getDifficultyName(difficulty: number): string {
  return DIFFICULTY_NAMES[difficulty] || `Lv.${difficulty}`;
}
