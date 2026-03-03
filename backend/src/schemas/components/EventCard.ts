/**
 * EventCard 组件
 * 活动卡片，可在列表、搜索结果、推荐等多处复用
 * 自带宽度约束 (min 400px / max 600px)
 */

import { Event } from '@/types/Event';
import { Server } from '@/types/Server';
import { SchemaNode } from '@/schemas/types';
import { card, text, tag, space, image } from '@/schemas/core/base';
import { getEventBannerUrlFallback, formatTimestamp } from '@/schemas/core/utils';
import { createTranslator, Language, DEFAULT_LANGUAGE } from '@/i18n';

export interface EventCardProps {
  event: Event;
  server?: Server;
  language?: Language;
}

/**
 * 构建活动卡片
 * 包含: Banner(可点击) + 标题(可点击) + 类型/ID/状态 Tags + 日期
 */
export function EventCard(props: EventCardProps): SchemaNode {
  const { event, server = Server.jp, language = DEFAULT_LANGUAGE } = props;
  const $t = createTranslator(language);
  const detailHref = `/info/event/${event.eventId}`;

  const bannerUrl = getEventBannerUrlFallback(event.bannerAssetBundleName);

  const eventName = event.eventName[server]
    || event.eventName.find(n => n != null)
    || `Event #${event.eventId}`;

  const eventTypeName = $t(`event.type.${event.eventType}`);

  const status = event.getEventStatus(server);
  const statusText = $t(`event.status.${status === 'not_start' ? 'notStarted' : status === 'in_progress' ? 'inProgress' : 'ended'}`);
  const statusTagType = status === 'in_progress' ? 'success' : status === 'ended' ? 'info' : 'warning';

  const startAt = event.startAt[server];
  const endAt = event.endAt[server];
  let dateText = '';
  if (startAt && endAt) {
    dateText = `${formatTimestamp(startAt,'datetime')} ~ ${formatTimestamp(endAt, 'datetime')}`;
  }

  return card({ shadow: 'hover' }, [
    space([
      { ...image(bannerUrl, { maxHeight: 140, fit: 'cover', alt: eventName, lazy: true }), href: detailHref },
      { ...text(eventName, { type: 'primary' }), href: detailHref },
      space([
        tag(eventTypeName, { type: 'info', size: 'small' }),
        tag(`#${event.eventId}`, { effect: 'plain', size: 'small' }),
        tag(statusText, { type: statusTagType as any, size: 'small' }),
      ], { size: 'small', wrap: true }),
      ...(dateText ? [text(dateText, { size: 'small', type: 'info' })] : []),
    ], { direction: 'vertical', size: 'small' })
  ], {
    minWidth: '400px',
    maxWidth: '600px'
  });
}
