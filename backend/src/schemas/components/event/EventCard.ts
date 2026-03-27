/**
 * EventCard 组件
 * 活动卡片，可在列表、搜索结果、推荐等多处复用
 */

import { Event } from '@/types/Event';
import { Server } from '@/types/Server';
import { SchemaNode } from '@/schemas/types';
import { card, text, tag, space, image } from '@/schemas/core/base';
import { getEventBannerUrlFallback, getServerIconUrl, getServerKey, formatTimestamp } from '@/schemas/core/utils';
import { createTranslator, Language, DEFAULT_LANGUAGE } from '@/i18n';

export interface EventCardProps {
  event: Event;
  displayedServerList?: Server[];
  server?: Server;
  language?: Language;
}

/**
 * 从 displayedServerList 中找到所有有时间数据的服务器
 */
function findServersWithTime(event: Event, serverList: Server[]): { server: Server, startAt: number, endAt: number }[] {
  const results: { server: Server, startAt: number, endAt: number }[] = [];
  for (const server of serverList) {
    const startAt = event.startAt[server];
    const endAt = event.endAt[server];
    if (startAt && endAt) {
      results.push({ server, startAt, endAt });
    }
  }
  return results;
}

/**
 * 构建活动卡片
 * 包含: Banner(可点击) + 标题(可点击) + 类型/ID Tags + 时间行(带服务器图标)
 */
export function EventCard(props: EventCardProps): SchemaNode {
  const {
    event,
    displayedServerList = [props.server ?? Server.jp],
    language = DEFAULT_LANGUAGE,
  } = props;
  const mainServer = displayedServerList[0];
  const $t = createTranslator(language);
  const detailHref = `/info/event/${event.eventId}`;

  const bannerUrl = getEventBannerUrlFallback(event.bannerAssetBundleName);

  const eventName = event.eventName[mainServer]
    || event.eventName.find(n => n != null)
    || `Event #${event.eventId}`;

  const eventTypeName = $t(`event.type.${event.eventType}`);

  // Tags: 类型 + ID (不再显示状态 tag)
  const tags: SchemaNode[] = [
    tag(eventTypeName, { type: 'info', size: 'small' }),
    tag(`#${event.eventId}`, { effect: 'plain', size: 'small' }),
  ];

  // 时间行: 显示所有选中服务器的时间
  const timeEntries = findServersWithTime(event, displayedServerList);
  const timeChildren: SchemaNode[] = timeEntries.map(info => {
    const serverKey = getServerKey(info.server);
    return space([
      image(getServerIconUrl(serverKey), { width: 16, height: 16, fit: 'contain' }),
      text(
        `${formatTimestamp(info.startAt, 'datetime')} ~ ${formatTimestamp(info.endAt, 'datetime')}`,
        { size: 'small', type: 'info' }
      ),
    ], { size: 'small', alignment: 'center' });
  });

  return card({ shadow: 'hover' }, [
    space([
      { ...image(bannerUrl, { maxHeight: 140, fit: 'cover', alt: eventName, lazy: true }), href: detailHref },
      { ...text(eventName, { type: 'primary' }), href: detailHref },
      space(tags, { size: 'small', wrap: true }),
      ...timeChildren,
    ], { direction: 'vertical', size: 'small' })
  ], {
    minWidth: '400px',
    maxWidth: '600px'
  });
}
