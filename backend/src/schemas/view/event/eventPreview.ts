/**
 * Event Preview Schema Builder
 * 活动预览页面
 */

import { Event } from '@/types/Event';
import { SchemaNode } from '@/schemas/types';
import { page, container, card, text, descriptions } from '@/schemas/core/base';

/**
 * Build event preview schema
 */
export function buildEventPreviewSchema(event: Event): SchemaNode {
  return page(
    { title: `活动 ${event.eventId} 预览` },
    [
      container([
        card({ header: '活动概要' }, [
          descriptions([
            { label: '活动ID', value: event.eventId },
            { label: '活动类型', value: event.eventType },
            { label: '活动名称', value: event.eventName[0] || '未知' }
          ], { column: 1, border: true })
        ])
      ])
    ]
  );
}
