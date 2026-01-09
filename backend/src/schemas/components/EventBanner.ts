/**
 * EventBanner 组件
 * 显示活动 Banner 图片
 */

import { SchemaNode } from '@/schemas/types';
import { card, image } from '@/schemas/core/base';
import { getEventBannerUrl, getEventBannerUrlFallback } from '@/schemas/core/utils';
import { Event } from '@/types/Event';

export interface EventBannerProps {
  event: Event;
  server?: string;
  showShadow?: boolean;
}

/**
 * 构建活动 Banner 组件
 * 返回纯图片，不包裹卡片
 */
export function EventBanner(props: EventBannerProps): SchemaNode {
  const { event, server = 'jp' } = props;

  // 使用 assetBundleName 构建正确的 URL
  const bannerUrl = event.assetBundleName
    ? getEventBannerUrl(event.assetBundleName, server)
    : getEventBannerUrlFallback(event.bannerAssetBundleName);

  return image(bannerUrl, {
    width: '100%',
    fit: 'cover',
    alt: `Event ${event.eventId} Banner`
  });
}
