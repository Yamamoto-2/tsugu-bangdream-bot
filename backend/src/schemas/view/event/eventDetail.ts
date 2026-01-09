/**
 * Event Detail 页面 Schema 构建器
 * 活动详情页面
 */

import { Event } from '@/types/Event';
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

export interface EventDetailOptions {
  imageMode?: 'url' | 'base64';
  displayedServerList?: Server[];
  showGacha?: boolean;
  showSongs?: boolean;
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

  // 1. Banner
  children.push(EventBanner({ event, server: serverKey }));

  // 2. 基本信息卡片
  children.push(buildBasicInfoCard(event, displayedServerList));

  // 3. 活动加成卡片
  children.push(BonusDisplay({ event }));

  // 4. 奖励卡牌卡片
  if (event.rewardCards && event.rewardCards.length > 0) {
    children.push(buildRewardCardsCard(event, serverKey));
  }

  // 5. 活动进度（如果正在进行中）
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
 * 基本信息卡片
 */
function buildBasicInfoCard(
  event: Event,
  displayedServerList: Server[]
): SchemaNode {
  // 活动名称
  const nameItems: DescriptionsItem[] = [];
  for (const server of displayedServerList) {
    const serverKey = getServerKey(server);
    const eventName = event.eventName[server];
    if (eventName) {
      nameItems.push({
        label: `${getServerName(serverKey)}名称`,
        value: eventName
      });
    }
  }

  // 基本信息
  const basicItems: DescriptionsItem[] = [
    { label: 'ID', value: event.eventId },
    { label: '类型', value: getEventTypeName(event.eventType) }
  ];

  // 开始/结束时间
  for (const server of displayedServerList) {
    const serverKey = getServerKey(server);
    const serverName = getServerName(serverKey);
    const startAt = event.startAt[server];
    const endAt = event.endAt[server];

    if (startAt) {
      basicItems.push({
        label: `${serverName}开始`,
        value: formatTimestamp(startAt, 'datetime')
      });
    }
    if (endAt) {
      basicItems.push({
        label: `${serverName}结束`,
        value: formatTimestamp(endAt, 'datetime')
      });
    }
  }

  return card({ header: '活动信息' }, [
    descriptions(nameItems, { column: 1, border: true }),
    divider(),
    descriptions(basicItems, { column: 2, border: true, size: 'small' })
  ]);
}

/**
 * 奖励卡牌卡片
 */
function buildRewardCardsCard(event: Event, server: string): SchemaNode {
  const cardImages: SchemaNode[] = [];

  for (const cardId of event.rewardCards) {
    cardImages.push(
      col({ xs: 6, sm: 4, md: 3 }, [
        space([
          text(`卡牌 #${cardId}`, { size: 'small', type: 'info' })
        ], { direction: 'vertical', size: 'small', alignment: 'center' })
      ])
    );
  }

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
