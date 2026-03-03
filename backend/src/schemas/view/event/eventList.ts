/**
 * Event List Schema 构建器
 * 活动列表/搜索结果页面
 */

import { Event } from '@/types/Event';
import { Server } from '@/types/Server';
import { SchemaNode } from '@/schemas/types';
import {
  page,
  container,
  card,
  text,
  tag,
  space,
  row,
  col,
  image,
  link,
  empty,
} from '@/schemas/core/base';
import { getEventBannerUrlFallback, getServerKey, formatTimestamp } from '@/schemas/core/utils';
import { createTranslator, Language, DEFAULT_LANGUAGE } from '@/i18n';

export interface EventListOptions {
  displayedServerList?: Server[];
  language?: Language;
}

/**
 * 构建活动列表 Schema
 */
export function buildEventListSchema(
  events: Event[],
  options: EventListOptions = {}
): SchemaNode {
  const displayedServerList = options.displayedServerList || [Server.jp];
  const mainServer = displayedServerList[0];
  const language = options.language || DEFAULT_LANGUAGE;
  const $t = createTranslator(language);

  if (events.length === 0) {
    return page({ title: $t('event.title.list') }, [
      container([empty({ description: $t('event.list.noResults') })])
    ]);
  }

  const eventCards = events.map(event => buildEventCard(event, mainServer, language));

  return page({ title: $t('event.title.list') }, [
    container(eventCards)
  ]);
}

/**
 * 构建单个活动卡片
 */
function buildEventCard(event: Event, mainServer: Server, language: Language): SchemaNode {
  const $t = createTranslator(language);
  const serverKey = getServerKey(mainServer);

  // Banner 缩略图 URL
  const bannerUrl = getEventBannerUrlFallback(event.bannerAssetBundleName);

  // 活动名称（取主服务器的名称，fallback 到其他服务器）
  const eventName = event.eventName[mainServer]
    || event.eventName.find(n => n != null)
    || `Event #${event.eventId}`;

  // 活动类型名
  const eventTypeName = $t(`event.type.${event.eventType}`);

  // 状态
  const status = event.getEventStatus(mainServer);
  const statusText = $t(`event.status.${status === 'not_start' ? 'notStarted' : status === 'in_progress' ? 'inProgress' : 'ended'}`);
  const statusTagType = status === 'in_progress' ? 'success' : status === 'ended' ? 'info' : 'warning';

  // 日期范围
  const startAt = event.startAt[mainServer];
  const endAt = event.endAt[mainServer];
  let dateText = '';
  if (startAt && endAt) {
    dateText = `${formatTimestamp(startAt, 'date')} ~ ${formatTimestamp(endAt, 'date')}`;
  }

  return card({ shadow: 'hover' }, [
    row({ gutter: 16, align: 'middle' }, [
      col({ xs: 24, sm: 8 }, [
        image(bannerUrl, { width: '100%', fit: 'cover', alt: `Event ${event.eventId}`, lazy: true })
      ]),
      col({ xs: 24, sm: 16 }, [
        space([
          link(eventName, `/info/event/${event.eventId}`, { type: 'primary' }),
          space([
            tag(eventTypeName, { type: 'info', size: 'small' }),
            tag(`#${event.eventId}`, { effect: 'plain', size: 'small' }),
            tag(statusText, { type: statusTagType as any, size: 'small' }),
          ], { size: 'small', wrap: true }),
          ...(dateText ? [text(dateText, { size: 'small', type: 'info' })] : []),
        ], { direction: 'vertical', size: 'small' })
      ])
    ])
  ]);
}
