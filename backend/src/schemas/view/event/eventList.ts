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
  image,
  empty,
  table,
} from '@/schemas/core/base';
import {
  getEventBannerUrlFallback,
  getServerIconUrl,
  getServerKey,
  formatTimestamp,
} from '@/schemas/core/utils';
import { EventCard } from '@/schemas/components/event/EventCard';
import { createTranslator, Language, DEFAULT_LANGUAGE } from '@/i18n';
import { TableColumn } from '@/schemas/types';
import { AttributeBonusList } from '@/schemas/components/common/AttributeTag';
import { CharacterBonusList } from '@/schemas/components/character/CharacterIcon';

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
    return page({ title: $t('event.title.list') }, [
      container([buildEventTable(events, displayedServerList, language)], { maxWidth: 'none' })
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

function buildEventTable(events: Event[], displayedServerList: Server[], language: Language): SchemaNode {
  const mainServer = displayedServerList[0];
  const $t = createTranslator(language);

  const columns: TableColumn[] = [
    { prop: 'id', label: 'ID', flex: 1, align: 'center' },
    { prop: 'banner', label: 'Banner', flex: 3 },
    { prop: 'name', label: $t('event.label.name'), flex: 4 },
    { prop: 'type', label: $t('event.label.type'), flex: 2, align: 'center' },
    { prop: 'time', label: $t('event.label.start'), flex: 3 },
    { prop: 'bonus', label: $t('bonus.attribute'), flex: 3 },
    { prop: 'character', label: $t('bonus.character'), flex: 3 },
  ];

  const data = events.map(event => {
    const detailHref = `/info/event/${event.eventId}`;
    const bannerUrl = getEventBannerUrlFallback(event.bannerAssetBundleName);
    const eventTypeName = $t(`event.type.${event.eventType}`);

    // 名称列: 显示所有选中服务器的名称
    const nameNodes: SchemaNode[] = [];
    for (const server of displayedServerList) {
      const serverKey = getServerKey(server);
      const name = event.eventName[server];
      if (name) {
        nameNodes.push(
          space([
            image(getServerIconUrl(serverKey), { width: 14, height: 14, fit: 'contain' }),
            text(name, { size: 'small' }),
          ], { size: 'small', alignment: 'center' })
        );
      }
    }
    // fallback: 没有任何名称时显示 Event #ID
    if (nameNodes.length === 0) {
      nameNodes.push(text(`Event #${event.eventId}`, { size: 'small' }));
    }
    const nameCell: SchemaNode = {
      ...space(nameNodes, { direction: 'vertical', size: 'small' }),
      href: detailHref,
    };

    // 时间列: 显示所有选中服务器的时间
    const timeNodes: SchemaNode[] = [];
    for (const server of displayedServerList) {
      const serverKey = getServerKey(server);
      const startAt = event.startAt[server];
      const endAt = event.endAt[server];
      if (startAt && endAt) {
        timeNodes.push(
          space([
            image(getServerIconUrl(serverKey), { width: 14, height: 14, fit: 'contain' }),
            text(
              `${formatTimestamp(startAt, 'date')} ~ ${formatTimestamp(endAt, 'date')}`,
              { size: 'small' }
            ),
          ], { size: 'small', alignment: 'center' })
        );
      }
    }
    const timeCell = timeNodes.length > 0
      ? space(timeNodes, { direction: 'vertical', size: 'small' })
      : '';

    // 属性加成列
    const attributeList = event.getAttributeList();
    const bonusCell = Object.keys(attributeList).length > 0
      ? AttributeBonusList(attributeList)
      : '';

    // 角色加成列
    const characterList = event.getCharacterList();
    const characterCell = Object.keys(characterList).length > 0
      ? CharacterBonusList(characterList)
      : '';

    return {
      id: { ...text(`#${event.eventId}`, { size: 'small' }), href: detailHref },
      banner: { ...image(bannerUrl, { width: 160, fit: 'cover', alt: nameNodes[0] ? '' : `Event ${event.eventId}`, lazy: true }), href: detailHref },
      name: nameCell,
      type: tag(eventTypeName, { type: 'info', size: 'small' }),
      time: timeCell,
      bonus: bonusCell,
      character: characterCell,
    };
  });

  return table(data, columns, { stripe: true });
}
