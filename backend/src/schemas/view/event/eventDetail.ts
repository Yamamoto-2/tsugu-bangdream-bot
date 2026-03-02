/**
 * Event Detail 页面 Schema 构建器
 * 活动详情页面
 */

import { Event } from '@/types/Event';
import { Card } from '@/types/Card';
import { Server } from '@/types/Server';
import { SchemaNode, DescriptionsItem } from '@/schemas/types';
import {
  page,
  container,
  row,
  col,
  card,
  text,
  divider,
  descriptions,
  space,
  progress
} from '@/schemas/core/base';
import { getServerKey } from '@/schemas/core/utils';
import { createTranslator, getDateLocale, Language, DEFAULT_LANGUAGE } from '@/i18n';

// 导入组件
import { EventBanner } from '@/schemas/components/EventBanner';
import { BonusDisplay } from '@/schemas/components/BonusDisplay';
import { CardIcon, CardIconList } from '@/schemas/components/CardIcon';

export interface EventDetailOptions {
  imageMode?: 'url' | 'base64';
  displayedServerList?: Server[];
  language?: Language;
  showGacha?: boolean;
  showSongs?: boolean;
  // 预获取的卡牌数据
  rewardCards?: Card[];
}

/**
 * 构建活动详情页面 Schema
 */
export function buildEventDetailSchema(
  event: Event,
  options: EventDetailOptions = {}
): SchemaNode {
  const displayedServerList = options.displayedServerList || [Server.jp];
  const mainServer = displayedServerList[0];
  const serverKey = getServerKey(mainServer);
  const language = options.language || DEFAULT_LANGUAGE;
  const $t = createTranslator(language);

  const children: SchemaNode[] = [];

  // 主信息卡片（包含 Banner、基本信息、加成信息）
  children.push(buildMainInfoCard(event, displayedServerList, serverKey, language));

  // 奖励卡牌卡片
  if (options.rewardCards && options.rewardCards.length > 0) {
    children.push(buildRewardCardsCard(options.rewardCards, serverKey, language));
  } else if (event.rewardCards && event.rewardCards.length > 0) {
    // 如果没有预获取的卡牌数据，显示占位符
    children.push(buildRewardCardsPlaceholder(event.rewardCards, language));
  }

  // 活动进度（如果正在进行中）
  const startAt = event.startAt[mainServer];
  const endAt = event.endAt[mainServer];
  if (startAt && endAt) {
    const status = event.getEventStatus(mainServer);
    if (status === 'in_progress') {
      children.push(buildProgressCard(startAt, endAt, language));
    }
  }

  return page(
    { title: $t('event.title.detail', { eventId: event.eventId }) },
    [container(children)]
  );
}

/**
 * 主信息卡片（Banner + 基本信息 + 加成）
 */
function buildMainInfoCard(
  event: Event,
  displayedServerList: Server[],
  serverKey: string,
  language: Language
): SchemaNode {
  const $t = createTranslator(language);
  const cardChildren: SchemaNode[] = [];

  // Banner 图片
  cardChildren.push(EventBanner({ event, server: serverKey }));

  // 活动名称
  for (const server of displayedServerList) {
    const sKey = getServerKey(server);
    const eventName = event.eventName[server];
    if (eventName) {
      cardChildren.push(divider());
      cardChildren.push(
        space([
          text(`${$t(`server.${sKey}`)} ${$t('event.label.name')}`, { type: 'info' }),
          text(eventName)
        ], { size: 'default' })
      );
    }
  }

  // 类型和ID
  cardChildren.push(divider());
  cardChildren.push(
    space([
      space([
        text($t('event.label.type'), { type: 'info' }),
        text($t(`event.type.${event.eventType}`))
      ], { size: 'small' }),
      space([
        text($t('event.label.id'), { type: 'info' }),
        text(String(event.eventId))
      ], { size: 'small' })
    ], { size: 'large' })
  );

  // 开始/结束时间
  for (const server of displayedServerList) {
    const sKey = getServerKey(server);
    const serverName = $t(`server.${sKey}`);
    const startAt = event.startAt[server];
    const endAt = event.endAt[server];

    if (startAt) {
      cardChildren.push(divider());
      cardChildren.push(
        space([
          text(`${serverName} ${$t('event.label.start')}`, { type: 'info' }),
          text(formatTimestampLocalized(startAt, 'datetime', language))
        ], { size: 'default' })
      );
    }
    if (endAt) {
      cardChildren.push(divider());
      cardChildren.push(
        space([
          text(`${serverName} ${$t('event.label.end')}`, { type: 'info' }),
          text(formatTimestampLocalized(endAt, 'datetime', language))
        ], { size: 'default' })
      );
    }
  }

  // 加成信息（属性、角色、偏科）
  const bonusNodes = BonusDisplay({ event, language });
  cardChildren.push(...bonusNodes);

  return card({ shadow: 'hover' }, cardChildren);
}

/**
 * 奖励卡牌卡片（使用 CardIcon 渲染）
 */
function buildRewardCardsCard(cards: Card[], server: string, language: Language): SchemaNode {
  const $t = createTranslator(language);
  return card({ header: $t('event.label.rewardCards') }, [
    CardIconList(cards, {
      server,
      showId: true,
      showRarity: true,
      size: 'medium'
    })
  ]);
}

/**
 * 奖励卡牌占位符（没有预获取数据时显示）
 */
function buildRewardCardsPlaceholder(cardIds: number[], language: Language): SchemaNode {
  const $t = createTranslator(language);
  const cardImages: SchemaNode[] = cardIds.map(cardId =>
    col({ xs: 6, sm: 4, md: 3 }, [
      space([
        text(`${$t('card.label.card')} #${cardId}`, { size: 'small', type: 'info' })
      ], { direction: 'vertical', size: 'small', alignment: 'center' })
    ])
  );

  return card({ header: $t('event.label.rewardCards') }, [
    row({ gutter: 16 }, cardImages)
  ]);
}

/**
 * 活动进度卡片
 */
function buildProgressCard(startAt: number, endAt: number, language: Language): SchemaNode {
  const $t = createTranslator(language);
  const progressPercent = getEventProgress(startAt, endAt);
  const remaining = formatEventRemainingLocalized(endAt, language);

  return card({ header: $t('event.label.progress') }, [
    space([
      progress(progressPercent, {
        strokeWidth: 20,
        status: progressPercent >= 100 ? 'success' : undefined
      }),
      row({ justify: 'space-between' }, [
        col({ span: 12 }, [
          text(`${$t('event.label.remaining')}: ${remaining}`, { size: 'small' })
        ]),
        col({ span: 12 }, [
          text(`${$t('event.label.progressPercent')}: ${progressPercent}%`, { size: 'small' })
        ])
      ])
    ], { direction: 'vertical', fill: true })
  ]);
}

// ========== 本地化辅助函数 ==========

/**
 * 本地化时间戳格式化
 */
function formatTimestampLocalized(
  timestamp: number,
  format: 'date' | 'datetime' | 'relative',
  language: Language
): string {
  const date = new Date(timestamp);
  const locale = getDateLocale(language);
  const $t = createTranslator(language);

  if (format === 'date') {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  if (format === 'datetime') {
    return date.toLocaleString(locale, {
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
    if (absDiff < 60 * 1000) return $t('time.aboutToStart');
    if (absDiff < 60 * 60 * 1000) return $t('time.minutesLater', { minutes: Math.floor(absDiff / 60000) });
    if (absDiff < 24 * 60 * 60 * 1000) return $t('time.hoursLater', { hours: Math.floor(absDiff / 3600000) });
    return $t('time.daysLater', { days: Math.floor(absDiff / 86400000) });
  }

  if (diff < 60 * 1000) return $t('time.justNow');
  if (diff < 60 * 60 * 1000) return $t('time.minutesAgo', { minutes: Math.floor(diff / 60000) });
  if (diff < 24 * 60 * 60 * 1000) return $t('time.hoursAgo', { hours: Math.floor(diff / 3600000) });
  if (diff < 30 * 24 * 60 * 60 * 1000) return $t('time.daysAgo', { days: Math.floor(diff / 86400000) });
  return formatTimestampLocalized(timestamp, 'date', language);
}

/**
 * 本地化活动剩余时间格式化
 */
function formatEventRemainingLocalized(endAt: number, language: Language): string {
  const $t = createTranslator(language);
  const now = Date.now();
  const remaining = endAt - now;

  if (remaining <= 0) return $t('time.remaining.ended');

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);

  if (days > 0) return $t('time.remaining.daysHours', { days, hours });
  if (hours > 0) return $t('time.remaining.hoursMinutes', { hours, minutes });
  return $t('time.remaining.minutes', { minutes });
}

/**
 * 获取活动进度百分比
 */
function getEventProgress(startAt: number, endAt: number): number {
  const now = Date.now();
  if (now < startAt) return 0;
  if (now > endAt) return 100;
  return Math.round((now - startAt) / (endAt - startAt) * 100);
}
