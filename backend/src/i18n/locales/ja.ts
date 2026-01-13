import type { I18nDictionary } from '../types';

export const ja: I18nDictionary = {
  // 服务器名称
  server: {
    jp: '日本版',
    en: 'グローバル版',
    tw: '台湾版',
    cn: '中国版',
    kr: '韓国版',
  },

  // 活动相关
  event: {
    type: {
      story: 'ストーリーイベント',
      versus: 'VSライブ',
      live_try: 'ライブトライ',
      challenge: 'チャレンジライブ',
      mission_live: 'ミッションライブ',
      festival: 'チームフェスティバル',
      medley: 'メドレーライブ',
    },
    label: {
      server: 'サーバー',
      eventType: 'イベントタイプ',
      eventId: 'イベントID',
      eventName: 'イベント名',
      startTime: '開始時間',
      endTime: '終了時間',
      bonus: 'イベントボーナス',
      rewards: '報酬カード',
      attribute: '属性ボーナス',
      character: 'キャラボーナス',
    },
    time: {
      notStarted: '未開始',
      inProgress: '開催中',
      ended: '終了',
      remaining: '残り {days}日 {hours}時間',
      minutesRemaining: 'あと {minutes}分',
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
      cardId: 'カードID',
      character: 'キャラクター',
      attribute: '属性',
      rarity: 'レアリティ',
      skill: 'スキル',
      releaseDate: '実装日',
    },
  },

  // 属性
  attribute: {
    powerful: 'パワフル',
    cool: 'クール',
    pure: 'ピュア',
    happy: 'ハッピー',
  },

  // 乐队
  band: {
    1: "Poppin'Party",
    2: 'Afterglow',
    3: 'Pastel*Palettes',
    4: 'Roselia',
    5: 'ハロー、ハッピーワールド！',
    18: 'RAISE A SUILEN',
    21: 'Morfonica',
    45: 'MyGO!!!!!',
    46: 'Ave Mujica',
  },

  // 通用
  common: {
    loading: '読み込み中...',
    error: '読み込み失敗',
    noData: 'データなし',
    percent: '{value}%',
    name: '名前',
    id: 'ID',
    type: 'タイプ',
    start: '開始',
    end: '終了',
  },

  // 歌曲相关
  song: {
    label: {
      songId: '楽曲ID',
      songName: '楽曲名',
      composer: '作曲',
      arranger: '編曲',
      lyricist: '作詞',
      bpm: 'BPM',
      duration: '長さ',
      band: 'バンド',
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
      characterId: 'キャラクターID',
      characterName: 'キャラクター名',
      band: '所属バンド',
    },
  },

  // 抽卡相关
  gacha: {
    label: {
      gachaId: 'ガチャID',
      gachaName: 'ガチャ名',
      type: 'タイプ',
      period: '期間',
    },
    type: {
      permanent: '恒常',
      limited: '限定',
      special: '特別',
      birthday: '誕生日',
      dream_festival: 'ドリフェス',
    },
  },
};
