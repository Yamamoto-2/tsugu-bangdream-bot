/**
 * 日本語翻訳
 */
import type { I18nDictionary } from '../types';

export const ja: I18nDictionary = {
  // サーバー名
  server: {
    jp: '日本',
    en: '海外',
    tw: '台湾',
    cn: '中国',
    kr: '韓国',
  },

  // イベント関連
  event: {
    // イベントタイプ
    type: {
      story: '通常イベント',
      versus: 'VSライブ',
      live_try: 'ライブトライ',
      challenge: 'チャレンジライブ',
      mission_live: 'ミッションライブ',
      festival: 'チームライブ',
      medley: 'メドレーライブ',
    },
    // ラベル
    label: {
      name: '名前',
      type: 'タイプ',
      id: 'ID',
      start: '開始',
      end: '終了',
      bonus: 'イベントボーナス',
      rewardCards: '報酬カード',
      progress: 'イベント進捗',
      remaining: '残り',
      progressPercent: '進捗',
    },
    // 時間ステータス
    status: {
      notStarted: '未開始',
      inProgress: '開催中',
      ended: '終了',
    },
    // ページタイトル
    title: {
      detail: 'イベント {eventId} 詳細',
    },
  },

  // カード関連
  card: {
    label: {
      card: 'カード',
      cardId: 'カードID',
      character: 'キャラクター',
      attribute: '属性',
      rarity: 'レアリティ',
      skill: 'スキル',
    },
    rarity: {
      1: '★',
      2: '★★',
      3: '★★★',
      4: '★★★★',
      5: '★★★★★',
    },
  },

  // 時間フォーマット
  time: {
    justNow: 'たった今',
    minutesAgo: '{minutes}分前',
    hoursAgo: '{hours}時間前',
    daysAgo: '{days}日前',
    aboutToStart: 'まもなく開始',
    minutesLater: '{minutes}分後',
    hoursLater: '{hours}時間後',
    daysLater: '{days}日後',
    remaining: {
      ended: '終了',
      daysHours: '{days}日{hours}時間',
      hoursMinutes: '{hours}時間{minutes}分',
      minutes: '{minutes}分',
    },
  },

  // 属性
  attribute: {
    powerful: 'パワフル',
    cool: 'クール',
    pure: 'ピュア',
    happy: 'ハッピー',
  },

  // バンド
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

  // 数字フォーマット
  number: {
    percent: '{value}%',
    billion: '{value}億',
    tenThousand: '{value}万',
  },

  // 共通
  common: {
    loading: '読み込み中...',
    error: '読み込み失敗',
    noData: 'データなし',
    notFound: '存在しません',
  },

  // ボーナス関連
  bonus: {
    attribute: '属性ボーナス',
    character: 'キャラボーナス',
    allFit: '編成ボーナス',
    percent: '+{value}%',
    stat: {
      performance: '演奏',
      technique: 'テクニック',
      visual: 'ビジュアル',
    },
  },

  // 楽曲関連
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

  // キャラクター関連
  character: {
    label: {
      characterId: 'キャラクターID',
      characterName: 'キャラクター名',
      band: '所属バンド',
    },
  },

  // ガチャ関連
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
