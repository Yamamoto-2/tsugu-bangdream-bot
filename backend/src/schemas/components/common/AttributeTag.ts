/**
 * AttributeTag 组件
 * 显示属性图标和加成百分比
 */

import { SchemaNode } from '@/schemas/types';
import { space, image, tag } from '@/schemas/core/base';
import { getAttributeIconUrl, ATTRIBUTE_COLORS, ATTRIBUTE_NAMES } from '@/schemas/core/utils';

export interface AttributeTagProps {
  attribute: string;
  percent?: number;
  showIcon?: boolean;
  showName?: boolean;
  size?: 'small' | 'default' | 'large';
}

/**
 * 构建属性标签组件
 */
export function AttributeTag(props: AttributeTagProps): SchemaNode {
  const {
    attribute,
    percent,
    showIcon = true,
    showName = false,
    size = 'default'
  } = props;

  const iconSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  const children: SchemaNode[] = [];

  if (showIcon) {
    children.push(
      image(getAttributeIconUrl(attribute), { width: iconSize, height: iconSize, fit: 'contain' })
    );
  }

  if (showName) {
    children.push(
      tag(ATTRIBUTE_NAMES[attribute] || attribute, { size: size === 'large' ? 'default' : 'small', effect: 'plain' })
    );
  }

  if (percent !== undefined) {
    children.push(
      tag(`+${percent}%`, { type: 'primary', size: size === 'large' ? 'default' : 'small' })
    );
  }

  return space(children, { size: 'small', alignment: 'center' });
}

/**
 * 构建属性加成列表
 * 每个百分比一行：[图标1][图标2]... +X%
 */
export function AttributeBonusList(
  attributeList: { [percent: string]: Array<{ name: string }> }
): SchemaNode {
  const rows: SchemaNode[] = [];

  for (const percent in attributeList) {
    const attributes = attributeList[percent];
    const rowChildren: SchemaNode[] = [];

    // 先添加所有属性图标
    for (const attr of attributes) {
      rowChildren.push(
        image(getAttributeIconUrl(attr.name), { width: 28, height: 28, fit: 'contain' })
      );
    }

    // 再添加百分比文字
    rowChildren.push(
      tag(`+${percent}%`, { type: 'primary', size: 'default' })
    );

    rows.push(space(rowChildren, { size: 'small', alignment: 'center' }));
  }

  return space(rows, { direction: 'vertical', size: 'small' });
}
