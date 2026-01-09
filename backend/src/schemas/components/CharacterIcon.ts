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
 * 每个百分比一行：[头像1][头像2]... +X%
 */
export function CharacterBonusList(
  characterList: { [percent: string]: number[] }
): SchemaNode {
  const rows: SchemaNode[] = [];

  for (const percent in characterList) {
    const characterIds = characterList[percent];
    const rowChildren: SchemaNode[] = [];

    // 先添加所有角色头像
    for (const charId of characterIds) {
      rowChildren.push(
        image(getCharacterIconUrl(charId), { width: 40, height: 40, fit: 'cover' })
      );
    }

    // 再添加百分比文字
    rowChildren.push(
      tag(`+${percent}%`, { type: 'success', size: 'default' })
    );

    rows.push(space(rowChildren, { size: 'small', alignment: 'center' }));
  }

  return space(rows, { direction: 'vertical', size: 'small' });
}
