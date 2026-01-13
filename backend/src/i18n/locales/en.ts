import type { I18nDictionary } from '../types';

export const en: I18nDictionary = {
  // 服务器名称
  server: {
    jp: 'Japanese',
    en: 'Global',
    tw: 'Taiwan',
    cn: 'Chinese',
    kr: 'Korean',
  },

  // 活动相关
  event: {
    type: {
      story: 'Story Event',
      versus: 'VS Live',
      live_try: 'Live Try',
      challenge: 'Challenge Live',
      mission_live: 'Mission Live',
      festival: 'Team Festival',
      medley: 'Medley Live',
    },
    label: {
      server: 'Server',
      eventType: 'Event Type',
      eventId: 'Event ID',
      eventName: 'Event Name',
      startTime: 'Start Time',
      endTime: 'End Time',
      bonus: 'Event Bonus',
      rewards: 'Reward Cards',
      attribute: 'Attribute Bonus',
      character: 'Character Bonus',
    },
    time: {
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      ended: 'Ended',
      remaining: '{days}d {hours}h remaining',
      minutesRemaining: 'in {minutes} minutes',
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
      cardId: 'Card ID',
      character: 'Character',
      attribute: 'Attribute',
      rarity: 'Rarity',
      skill: 'Skill',
      releaseDate: 'Release Date',
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
    loading: 'Loading...',
    error: 'Failed to load',
    noData: 'No data',
    percent: '{value}%',
    name: 'Name',
    id: 'ID',
    type: 'Type',
    start: 'Start',
    end: 'End',
  },

  // 歌曲相关
  song: {
    label: {
      songId: 'Song ID',
      songName: 'Song Name',
      composer: 'Composer',
      arranger: 'Arranger',
      lyricist: 'Lyricist',
      bpm: 'BPM',
      duration: 'Duration',
      band: 'Band',
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
      characterId: 'Character ID',
      characterName: 'Character Name',
      band: 'Band',
    },
  },

  // 抽卡相关
  gacha: {
    label: {
      gachaId: 'Gacha ID',
      gachaName: 'Gacha Name',
      type: 'Type',
      period: 'Period',
    },
    type: {
      permanent: 'Permanent',
      limited: 'Limited',
      special: 'Special',
      birthday: 'Birthday',
      dream_festival: 'Dream Festival',
    },
  },
};
