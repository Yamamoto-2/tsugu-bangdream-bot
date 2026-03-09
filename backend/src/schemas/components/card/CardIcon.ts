/**
 * CardIcon 组件
 * 生成 Canvas 指令，前端通用 Canvas 组件渲染
 */

import { SchemaNode, CanvasCommand } from '@/schemas/types';
import { space, text } from '@/schemas/core/base';
import { Card } from '@/types/Card';

export interface CardIconProps {
  card: Card;
  trained?: boolean;
  showId?: boolean;
  showRarity?: boolean;
  showAttribute?: boolean;
  showBand?: boolean;
  size?: 'small' | 'medium' | 'large';
  server?: string;
}

// 尺寸配置
const sizeConfig = {
  small: { width: 90, height: 90, iconSize: 22, starSize: 14, fontSize: 12 },
  medium: { width: 120, height: 120, iconSize: 30, starSize: 18, fontSize: 14 },
  large: { width: 180, height: 180, iconSize: 45, starSize: 26, fontSize: 18 }
};

// URL 构建函数
function getCardRip(cardId: number): string {
  if (cardId >= 9999) {
    return '200_rip';
  }
  const ripNumber = Math.floor(cardId / 50);
  return `${String(ripNumber).padStart(3, '0')}_rip`;
}

function getCardIconUrl(card: Card, trained: boolean, server: string): string {
  const status = trained && card.rarity >= 3 ? '_after_training' : '_normal';
  const rip = getCardRip(card.cardId);
  return `https://bestdori.com/assets/${server}/thumb/chara/card00${rip}/${card.resourceSetName}${status}.png`;
}

function getFrameUrl(rarity: number, attribute?: string): string {
  if (rarity === 1 && attribute) {
    return `https://bestdori.com/res/image/card-1-${attribute}.png`;
  }
  return `https://bestdori.com/res/image/card-${rarity}.png`;
}

function getStarUrl(trained: boolean, rarity: number): string {
  if (trained && rarity >= 3) {
    return '/assets/star_trained.png';
  }
  return '/assets/star.png';
}

function getAttributeIconUrl(attribute: string): string {
  return `https://bestdori.com/res/icon/${attribute}.svg`;
}

function getBandIconUrl(bandId: number): string {
  return `https://bestdori.com/res/icon/band_${bandId}.svg`;
}

/**
 * 构建卡牌图标的 Canvas 部分
 */
function buildCardCanvas(props: CardIconProps): SchemaNode {
  const {
    card,
    trained = false,
    showRarity = true,
    showAttribute = true,
    showBand = true,
    size = 'medium',
    server = 'jp'
  } = props;

  const config = sizeConfig[size];
  const { width, height, iconSize, starSize } = config;

  const commands: CanvasCommand[] = [];

  // 1. 绘制卡面
  commands.push({
    type: 'drawImage',
    src: getCardIconUrl(card, trained, server),
    x: 0, y: 0, w: width, h: height
  });

  // 2. 绘制边框
  commands.push({
    type: 'drawImage',
    src: getFrameUrl(card.rarity, card.attribute),
    x: 0, y: 0, w: width, h: height
  });

  // 3. 绘制属性图标（右上角）
  if (showAttribute && card.attribute) {
    commands.push({
      type: 'drawImage',
      src: getAttributeIconUrl(card.attribute),
      x: width - iconSize - 2, y: 2, w: iconSize, h: iconSize
    });
  }

  // 4. 绘制乐队图标（左上角）
  if (showBand && card.bandId) {
    commands.push({
      type: 'drawImage',
      src: getBandIconUrl(card.bandId),
      x: 2, y: 2, w: iconSize, h: iconSize
    });
  }

  // 5. 绘制星星（左下角，从下往上）
  if (showRarity && card.rarity > 0) {
    const starUrl = getStarUrl(trained, card.rarity);
    const starSpacing = starSize * 0.8;

    for (let i = 0; i < card.rarity; i++) {
      const y = height - starSize - 2 - (starSpacing * i);
      commands.push({
        type: 'drawImage',
        src: starUrl,
        x: 2, y, w: starSize, h: starSize
      });
    }
  }

  return {
    componentName: 'Canvas',
    props: { width, height, commands }
  };
}

/**
 * 构建卡牌图标组件
 * Canvas + 可选的 HTML 文字 ID
 */
export function CardIcon(props: CardIconProps): SchemaNode {
  const { card, showId = true, size = 'medium' } = props;
  const canvas = buildCardCanvas(props);

  if (!showId) {
    return canvas;
  }

  // 用 Space 垂直排列 Canvas 和 ID 文字
  return space([
    canvas,
    text(`#${card.cardId}`, { size: size === 'large' ? 'default' : 'small' })
  ], { direction: 'vertical', size: 'small', alignment: 'center' });
}

/**
 * 构建卡牌图标列表
 * 使用 Space 水平排列，自动换行
 */
export function CardIconList(cards: Card[], options: Omit<CardIconProps, 'card'> = {}): SchemaNode {
  const children = cards.map(card => CardIcon({ card, ...options }));
  return space(children, { wrap: true, size: 'default' });
}
