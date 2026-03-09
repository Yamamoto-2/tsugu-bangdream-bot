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
  /** Banner 宽度，不设置时根据 responsive 决定 */
  width?: string | number;
  /** Banner 高度，不设置时自动 */
  height?: string | number;
  /** 是否响应式缩放，默认 true。设为 false 保持原大小 */
  responsive?: boolean;
}

/**
 * 构建活动 Banner 组件
 * 返回纯图片，不包裹卡片
 */
export function EventBanner(props: EventBannerProps): SchemaNode {
  const {
    event,
    server = 'jp',
    width,
    height,
    responsive = true
  } = props;

  // 使用 assetBundleName 构建正确的 URL
  const bannerUrl = event.assetBundleName
    ? getEventBannerUrl(event.assetBundleName, server)
    : getEventBannerUrlFallback(event.bannerAssetBundleName);

  // 响应式模式使用 100% 宽度，否则使用指定宽度或 auto
  const imageWidth = responsive ? '100%' : (width ?? 'auto');
  const imageHeight = height ?? 'auto';

  // 非响应式模式需要覆盖 TsImage 的 max-width: 100%
  const css = responsive ? undefined : { maxWidth: 'none' };

  return image(bannerUrl, {
    width: imageWidth,
    height: imageHeight,
    fit: responsive ? 'cover' : 'none',
    alt: `Event ${event.eventId} Banner`
  }, css);
}
