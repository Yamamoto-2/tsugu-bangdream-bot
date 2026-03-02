/**
 * English translations
 */
import type { I18nDictionary } from '../types';

export const en: I18nDictionary = {
  // Server names
  server: {
    jp: 'JP',
    en: 'EN',
    tw: 'TW',
    cn: 'CN',
    kr: 'KR',
  },

  // Event related
  event: {
    // Event types
    type: {
      story: 'Story Event',
      versus: 'VS Live',
      live_try: 'Live Try',
      challenge: 'Challenge Live',
      mission_live: 'Mission Live',
      festival: 'Team Live',
      medley: 'Medley Live',
    },
    // Labels
    label: {
      name: 'Name',
      type: 'Type',
      id: 'ID',
      start: 'Start',
      end: 'End',
      bonus: 'Event Bonus',
      rewardCards: 'Reward Cards',
      progress: 'Event Progress',
      remaining: 'Remaining',
      progressPercent: 'Progress',
    },
    // Time status
    status: {
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      ended: 'Ended',
    },
    // Page title
    title: {
      detail: 'Event {eventId} Details',
    },
  },

  // Card related
  card: {
    label: {
      card: 'Card',
      cardId: 'Card ID',
      character: 'Character',
      attribute: 'Attribute',
      rarity: 'Rarity',
      skill: 'Skill',
    },
    rarity: {
      1: '★',
      2: '★★',
      3: '★★★',
      4: '★★★★',
      5: '★★★★★',
    },
  },

  // Time formatting
  time: {
    justNow: 'Just now',
    minutesAgo: '{minutes} min ago',
    hoursAgo: '{hours} hr ago',
    daysAgo: '{days} days ago',
    aboutToStart: 'Starting soon',
    minutesLater: 'in {minutes} min',
    hoursLater: 'in {hours} hr',
    daysLater: 'in {days} days',
    remaining: {
      ended: 'Ended',
      daysHours: '{days}d {hours}h',
      hoursMinutes: '{hours}h {minutes}m',
      minutes: '{minutes}m',
    },
  },

  // Attribute
  attribute: {
    powerful: 'Powerful',
    cool: 'Cool',
    pure: 'Pure',
    happy: 'Happy',
  },

  // Band
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

  // Number formatting
  number: {
    percent: '{value}%',
    billion: '{value}B',
    tenThousand: '{value}K',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Failed to load',
    noData: 'No data',
    notFound: 'Not found',
  },

  // Bonus related
  bonus: {
    attribute: 'Attribute Bonus',
    character: 'Character Bonus',
    allFit: 'All Fit Bonus',
    percent: '+{value}%',
    stat: {
      performance: 'Performance',
      technique: 'Technique',
      visual: 'Visual',
    },
  },

  // Song related
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

  // Character related
  character: {
    label: {
      characterId: 'Character ID',
      characterName: 'Character Name',
      band: 'Band',
    },
  },

  // Gacha related
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
