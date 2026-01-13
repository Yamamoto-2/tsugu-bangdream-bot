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
      festival: '团队Festival',
      medley: 'Medley Live',
    },
    // 标签文本
    label: {
      server: '服务器',
      eventType: '活动类型',
      eventId: '活动ID',
      eventName: '活动名称',
      startTime: '开始时间',
      endTime: '结束时间',
      bonus: '活动加成',
      rewards: '奖励卡牌',
      attribute: '属性加成',
      character: '角色加成',
    },
    // 时间相关
    time: {
      notStarted: '未开始',
      inProgress: '进行中',
      ended: '已结束',
      remaining: '剩余 {days} 天 {hours} 小时',
      minutesRemaining: '{minutes} 分钟后',
    },
  },

  // 卡牌相关
  card: {
    rarity: {
      1: '★',
      2: '★★',
      3: '★★★',
      4: '★★★★',
      5: '★★★★★',
    },
    label: {
      cardId: '卡牌ID',
      character: '角色',
      attribute: '属性',
      rarity: '稀有度',
      skill: '技能',
      releaseDate: '发布日期',
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

  // 通用
  common: {
    loading: '加载中...',
    error: '加载失败',
    noData: '暂无数据',
    percent: '{value}%',
    name: '名称',
    id: 'ID',
    type: '类型',
    start: '开始',
    end: '结束',
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
