/**
 * CharacterIcon 组件
 * 显示角色头像
 */

import { SchemaNode } from '@/schemas/types';
import { space, image, tag, text } from '@/schemas/core/base';
import { getCharacterIconUrl } from '@/schemas/core/utils';

export interface CharacterIconProps {
  characterId: number;
  percent?: number;
  showName?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * 构建角色头像组件
 */
export function CharacterIcon(props: CharacterIconProps): SchemaNode {
  const { characterId, percent, showName = false, size = 'medium' } = props;

  const sizeMap = { small: 32, medium: 48, large: 64 };
  const iconSize = sizeMap[size];

  const children: SchemaNode[] = [];

  children.push(
    image(getCharacterIconUrl(characterId), { width: iconSize, height: iconSize, fit: 'cover' })
  );

  if (percent !== undefined) {
    children.push(tag(`+${percent}%`, { size: 'small', type: 'success' }));
  }

  return space(children, { direction: 'vertical', size: 'small', alignment: 'center' });
}

/**
 * 构建角色加成列表
 */
export function CharacterBonusList(
  characterList: { [percent: string]: number[] }
): SchemaNode {
  const children: SchemaNode[] = [];

  for (const percent in characterList) {
    const characterIds = characterList[percent];
    const rowChildren = characterIds.map(charId =>
      CharacterIcon({ characterId: charId, percent: parseInt(percent), size: 'medium' })
    );
    children.push(space(rowChildren, { wrap: true, size: 'default' }));
  }

  return space(children, { direction: 'vertical', size: 'small', fill: true });
}
