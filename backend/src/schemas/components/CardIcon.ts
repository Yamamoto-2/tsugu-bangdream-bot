/**
 * CardIcon 组件
 * 显示卡牌缩略图，带框架、稀有度星星等
 */

import { SchemaNode } from '@/schemas/types';
import { row, col, space, image, text, tag } from '@/schemas/core/base';
import { getCardIconUrl, getStarUrl, ATTRIBUTE_COLORS } from '@/schemas/core/utils';
import { Card } from '@/types/Card';

export interface CardIconProps {
  card: Card;
  trained?: boolean;
  showId?: boolean;
  showRarity?: boolean;
  showAttribute?: boolean;
  size?: 'small' | 'medium' | 'large';
  server?: string;
}

/**
 * 构建卡牌图标组件
 */
export function CardIcon(props: CardIconProps): SchemaNode {
  const {
    card,
    trained = false,
    showId = true,
    showRarity = false,
    showAttribute = false,
    size = 'medium',
    server = 'jp'
  } = props;

  const sizeMap = { small: 60, medium: 80, large: 120 };
  const iconSize = sizeMap[size];

  const canTrain = card.rarity >= 3;
  const actualTrained = canTrain && trained;

  const iconUrl = getCardIconUrl(
    card.resourceSetName,
    card.cardId,
    actualTrained,
    server
  );

  const children: SchemaNode[] = [];

  children.push(
    image(iconUrl, { width: iconSize, height: iconSize, fit: 'cover' })
  );

  if (showId) {
    children.push(text(`#${card.cardId}`, { size: 'small', type: 'info' }));
  }

  if (showRarity) {
    const stars: SchemaNode[] = [];
    for (let i = 0; i < card.rarity; i++) {
      stars.push(
        image(getStarUrl(actualTrained ? 'trained' : 'normal'), { width: 12, height: 12 })
      );
    }
    children.push(space(stars, { size: 2 }));
  }

  if (showAttribute && card.attribute) {
    children.push(tag(card.attribute, { size: 'small', effect: 'dark' }));
  }

  return space(children, { direction: 'vertical', size: 'small', alignment: 'center' });
}

/**
 * 构建卡牌图标列表
 */
export function CardIconList(cards: Card[], options: Omit<CardIconProps, 'card'> = {}): SchemaNode {
  const children = cards.map(card =>
    col({ xs: 6, sm: 4, md: 3, lg: 2 }, [CardIcon({ card, ...options })])
  );
  return row({ gutter: 16 }, children);
}
