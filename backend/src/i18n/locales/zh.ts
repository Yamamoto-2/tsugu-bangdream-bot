/**
 * 中文翻译 (默认语言)
 */
import type { I18nDictionary } from '../types';

export const zh: I18nDictionary = {
  // 服务器名称
  server: {
    jp: '日服',
    en: '国际服',
    tw: '台服',
    cn: '国服',
    kr: '韩服',
  },

  // 活动相关
  event: {
    // 活动类型
    type: {
      story: '普通活动',
      versus: 'VS Live',
      live_try: 'Live Try',
      challenge: '挑战Live',
      mission_live: 'Mission Live',
      festival: '团队Live',
      medley: '组曲Live',
    },
    // 标签文本
    label: {
      name: '名称',
      type: '类型',
      id: 'ID',
      start: '开始',
      end: '结束',
      bonus: '活动加成',
      rewardCards: '奖励卡牌',
      progress: '活动进度',
      remaining: '剩余',
      progressPercent: '进度',
    },
    // 时间状态
    status: {
      notStarted: '未开始',
      inProgress: '进行中',
      ended: '已结束',
    },
    // 页面标题
    title: {
      detail: '活动 {eventId} 详情',
    },
  },

  // 卡牌相关
  card: {
    label: {
      card: '卡牌',
      cardId: '卡牌ID',
      character: '角色',
      attribute: '属性',
      rarity: '稀有度',
      skill: '技能',
    },
    rarity: {
      1: '★',
      2: '★★',
      3: '★★★',
      4: '★★★★',
      5: '★★★★★',
    },
  },

  // 时间格式化
  time: {
    justNow: '刚刚',
    minutesAgo: '{minutes} 分钟前',
    hoursAgo: '{hours} 小时前',
    daysAgo: '{days} 天前',
    aboutToStart: '即将开始',
    minutesLater: '{minutes} 分钟后',
    hoursLater: '{hours} 小时后',
    daysLater: '{days} 天后',
    remaining: {
      ended: '已结束',
      daysHours: '{days}天{hours}小时',
      hoursMinutes: '{hours}小时{minutes}分钟',
      minutes: '{minutes}分钟',
    },
  },

  // 属性
  attribute: {
    powerful: 'Powerful',
    cool: 'Cool',
    pure: 'Pure',
    happy: 'Happy',
  },

  // 乐队
  band: {
    1: "Poppin'Party",
    2: 'Afterglow',
    3: 'Pastel*Palettes',
    4: 'Roselia',
    5: 'Hello, Happy World!',
    18: 'RAISE A SUILEN',
    21: 'Morfonica',
    45: 'MyGO!!!!!',
    46: 'Ave Mujica',
  },

  // 数字格式化
  number: {
    percent: '{value}%',
    billion: '{value}亿',
    tenThousand: '{value}万',
  },

  // 通用
  common: {
    loading: '加载中...',
    error: '加载失败',
    noData: '暂无数据',
    notFound: '不存在',
  },

  // 加成相关
  bonus: {
    attribute: '属性加成',
    character: '角色加成',
    allFit: '偏科加成',
    percent: '+{value}%',
    stat: {
      performance: '演奏',
      technique: '技巧',
      visual: '形象',
    },
  },

  // 歌曲相关
  song: {
    label: {
      songId: '歌曲ID',
      songName: '歌曲名',
      composer: '作曲',
      arranger: '编曲',
      lyricist: '作词',
      bpm: 'BPM',
      duration: '时长',
      band: '乐队',
    },
    difficulty: {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      expert: 'Expert',
      special: 'Special',
    },
  },

  // 角色相关
  character: {
    label: {
      characterId: '角色ID',
      characterName: '角色名',
      band: '所属乐队',
    },
  },

  // 抽卡相关
  gacha: {
    label: {
      gachaId: '卡池ID',
      gachaName: '卡池名称',
      type: '类型',
      period: '期间',
    },
    type: {
      permanent: '常驻',
      limited: '限定',
      special: '特殊',
      birthday: '生日',
      dream_festival: '梦想Festival',
    },
  },
};
