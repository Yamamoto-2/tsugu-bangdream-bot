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
import {
  getServerKey,
  getServerName,
  formatTimestamp,
  formatEventRemaining,
  getEventProgress,
  getEventTypeName
} from '@/schemas/core/utils';

// 导入组件
import { EventBanner } from '@/schemas/components/EventBanner';
import { BonusDisplay } from '@/schemas/components/BonusDisplay';
import { CardIcon, CardIconList } from '@/schemas/components/CardIcon';

export interface EventDetailOptions {
  imageMode?: 'url' | 'base64';
  displayedServerList?: Server[];
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

  const children: SchemaNode[] = [];

  // 主信息卡片（包含 Banner、基本信息、加成信息）
  children.push(buildMainInfoCard(event, displayedServerList, serverKey));

  // 奖励卡牌卡片
  if (options.rewardCards && options.rewardCards.length > 0) {
    children.push(buildRewardCardsCard(options.rewardCards, serverKey));
  } else if (event.rewardCards && event.rewardCards.length > 0) {
    // 如果没有预获取的卡牌数据，显示占位符
    children.push(buildRewardCardsPlaceholder(event.rewardCards));
  }

  // 活动进度（如果正在进行中）
  const startAt = event.startAt[mainServer];
  const endAt = event.endAt[mainServer];
  if (startAt && endAt) {
    const status = event.getEventStatus(mainServer);
    if (status === 'in_progress') {
      children.push(buildProgressCard(startAt, endAt));
    }
  }

  return page(
    { title: `活动 ${event.eventId} 详情` },
    [container(children)]
  );
}

/**
 * 主信息卡片（Banner + 基本信息 + 加成）
 */
function buildMainInfoCard(
  event: Event,
  displayedServerList: Server[],
  serverKey: string
): SchemaNode {
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
          text(`${getServerName(sKey)}名称`, { type: 'info' }),
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
        text('类型', { type: 'info' }),
        text(getEventTypeName(event.eventType))
      ], { size: 'small' }),
      space([
        text('ID', { type: 'info' }),
        text(String(event.eventId))
      ], { size: 'small' })
    ], { size: 'large' })
  );

  // 开始/结束时间
  for (const server of displayedServerList) {
    const sKey = getServerKey(server);
    const serverName = getServerName(sKey);
    const startAt = event.startAt[server];
    const endAt = event.endAt[server];

    if (startAt) {
      cardChildren.push(divider());
      cardChildren.push(
        space([
          text(`${serverName}开始`, { type: 'info' }),
          text(formatTimestamp(startAt, 'datetime'))
        ], { size: 'default' })
      );
    }
    if (endAt) {
      cardChildren.push(divider());
      cardChildren.push(
        space([
          text(`${serverName}结束`, { type: 'info' }),
          text(formatTimestamp(endAt, 'datetime'))
        ], { size: 'default' })
      );
    }
  }

  // 加成信息（属性、角色、偏科）
  const bonusNodes = BonusDisplay({ event });
  cardChildren.push(...bonusNodes);

  return card({ shadow: 'hover' }, cardChildren);
}

/**
 * 奖励卡牌卡片（使用 CardIcon 渲染）
 */
function buildRewardCardsCard(cards: Card[], server: string): SchemaNode {
  return card({ header: '奖励卡牌' }, [
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
function buildRewardCardsPlaceholder(cardIds: number[]): SchemaNode {
  const cardImages: SchemaNode[] = cardIds.map(cardId =>
    col({ xs: 6, sm: 4, md: 3 }, [
      space([
        text(`卡牌 #${cardId}`, { size: 'small', type: 'info' })
      ], { direction: 'vertical', size: 'small', alignment: 'center' })
    ])
  );

  return card({ header: '奖励卡牌' }, [
    row({ gutter: 16 }, cardImages)
  ]);
}

/**
 * 活动进度卡片
 */
function buildProgressCard(startAt: number, endAt: number): SchemaNode {
  const progressPercent = getEventProgress(startAt, endAt);
  const remaining = formatEventRemaining(endAt);

  return card({ header: '活动进度' }, [
    space([
      progress(progressPercent, {
        strokeWidth: 20,
        status: progressPercent >= 100 ? 'success' : undefined
      }),
      row({ justify: 'space-between' }, [
        col({ span: 12 }, [
          text(`剩余: ${remaining}`, { size: 'small' })
        ]),
        col({ span: 12 }, [
          text(`进度: ${progressPercent}%`, { size: 'small' })
        ])
      ])
    ], { direction: 'vertical', fill: true })
  ]);
}
