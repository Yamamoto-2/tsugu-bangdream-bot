/**
 * Event List Schema 构建器
 * 支持两种显示模式: card (卡片网格) / table (紧凑信息行)
 */

import { Event } from '@/types/Event';
import { Server } from '@/types/Server';
import { SchemaNode } from '@/schemas/types';
import {
  page,
  container,
  text,
  tag,
  space,
  row,
  col,
  image,
  empty,
  divider,
} from '@/schemas/core/base';
import {
  getEventBannerUrlFallback,
  getServerIconUrl,
  getServerKey,
  getAttributeIconUrl,
  getCharacterIconUrl,
  formatTimestamp,
} from '@/schemas/core/utils';
import { EventCard } from '@/schemas/components/EventCard';
import { createTranslator, Language, DEFAULT_LANGUAGE } from '@/i18n';

export type EventListMode = 'card' | 'table';

export interface EventListOptions {
  displayedServerList?: Server[];
  language?: Language;
  mode?: EventListMode;
}

/**
 * 构建活动列表 Schema
 */
export function buildEventListSchema(
  events: Event[],
  options: EventListOptions = {}
): SchemaNode {
  const displayedServerList = options.displayedServerList || [Server.jp];
  const language = options.language || DEFAULT_LANGUAGE;
  const mode = options.mode || 'card';
  const $t = createTranslator(language);

  if (events.length === 0) {
    return page({ title: $t('event.title.list') }, [
      container([empty({ description: $t('event.list.noResults') })])
    ]);
  }

  if (mode === 'table') {
    const items: SchemaNode[] = [];
    for (let i = 0; i < events.length; i++) {
      items.push(buildTableRow(events[i], displayedServerList, language));
      if (i < events.length - 1) {
        items.push(divider());
      }
    }
    return page({ title: $t('event.title.list') }, [
      container(items)
    ]);
  }

  // Card 模式: EventCard 自带宽度约束，container 用 flex-wrap 排列
  const items = events.map(event => EventCard({
    event,
    displayedServerList,
    language,
  }));
  return page({ title: $t('event.title.list') }, [
    container(items, {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      rowGap:'25px',
      columnGap:'25px'
    })
  ]);
}

// ========== Table 模式 ==========

function buildTableRow(event: Event, displayedServerList: Server[], language: Language): SchemaNode {
  const mainServer = displayedServerList[0];
  const $t = createTranslator(language);
  const detailHref = `/info/event/${event.eventId}`;

  const bannerUrl = getEventBannerUrlFallback(event.bannerAssetBundleName);
  const eventName = event.eventName[mainServer]
    || event.eventName.find(n => n != null)
    || `Event #${event.eventId}`;
  const eventTypeName = $t(`event.type.${event.eventType}`);

  // 右侧信息区域
  const infoChildren: SchemaNode[] = [];

  // 名称 + ID + 类型 (不再显示状态 tag)
  infoChildren.push(
    space([
      { ...text(eventName, { type: 'primary' }), href: detailHref },
      tag(`#${event.eventId}`, { effect: 'plain', size: 'small' }),
      tag(eventTypeName, { type: 'info', size: 'small' }),
    ], { size: 'small', wrap: true })
  );

  // 服务器时间: 按 displayedServerList 顺序，显示有时间数据的服务器(最多2个)
  let timeCount = 0;
  for (const server of displayedServerList) {
    if (timeCount >= 2) break;
    const serverKey = getServerKey(server);
    const startAt = event.startAt[server];
    const endAt = event.endAt[server];
    if (startAt && endAt) {
      infoChildren.push(
        space([
          image(getServerIconUrl(serverKey), { width: 18, height: 18, fit: 'contain' }),
          text(`${formatTimestamp(startAt, 'datetime')} ~ ${formatTimestamp(endAt, 'datetime')}`, { size: 'small', type: 'info' }),
        ], { size: 'small', alignment: 'center' })
      );
      timeCount++;
    }
  }

  // 属性加成
  const attributeList = event.getAttributeList();
  if (Object.keys(attributeList).length > 0) {
    const attrParts: SchemaNode[] = [];
    for (const percent in attributeList) {
      for (const attr of attributeList[percent]) {
        attrParts.push(image(getAttributeIconUrl(attr.name), { width: 20, height: 20, fit: 'contain' }));
      }
      attrParts.push(tag(`+${percent}%`, { type: 'primary', size: 'small' }));
    }
    infoChildren.push(space(attrParts, { size: 'small', alignment: 'center', wrap: true }));
  }

  // 角色加成
  const characterList = event.getCharacterList();
  if (Object.keys(characterList).length > 0) {
    const charParts: SchemaNode[] = [];
    for (const percent in characterList) {
      for (const charId of characterList[percent]) {
        charParts.push(image(getCharacterIconUrl(charId), { width: 24, height: 24, fit: 'cover' }));
      }
      charParts.push(tag(`+${percent}%`, { type: 'success', size: 'small' }));
    }
    infoChildren.push(space(charParts, { size: 'small', alignment: 'center', wrap: true }));
  }

  // 偏科加成
  if (event.eventCharacterParameterBonus && Object.keys(event.eventCharacterParameterBonus).length > 0) {
    const statParts: string[] = [];
    for (const stat in event.eventCharacterParameterBonus) {
      if (stat === 'eventId') continue;
      const value = (event.eventCharacterParameterBonus as any)[stat];
      if (value && value > 0) {
        statParts.push(`${$t(`bonus.stat.${stat}`)} +${value}%`);
      }
    }
    if (statParts.length > 0) {
      infoChildren.push(text(statParts.join('  '), { size: 'small', type: 'info' }));
    }
  }

  return row({ gutter: 12, align: 'top' }, [
    col({ xs: 10, sm: 8, md: 6 }, [
      { ...image(bannerUrl, { width: '100%', fit: 'cover', alt: eventName, lazy: true }), href: detailHref }
    ]),
    col({ xs: 14, sm: 16, md: 18 }, [
      space(infoChildren, { direction: 'vertical', size: 'small' })
    ])
  ]);
}
