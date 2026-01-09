/**
 * BonusDisplay 组件
 * 统一显示活动加成（属性加成 + 角色加成 + 偏科加成）
 */

import { SchemaNode, DescriptionsItem } from '@/schemas/types';
import { card, space, text, divider, descriptions } from '@/schemas/core/base';
import { AttributeBonusList } from '@/schemas/components/AttributeTag';
import { CharacterBonusList } from '@/schemas/components/CharacterIcon';
import { Event } from '@/types/Event';

export interface BonusDisplayProps {
  event: Event;
}

/**
 * 构建活动加成显示组件
 */
export function BonusDisplay(props: BonusDisplayProps): SchemaNode {
  const { event } = props;
  const children: SchemaNode[] = [];

  // 属性加成
  const attributeList = event.getAttributeList();
  if (Object.keys(attributeList).length > 0) {
    children.push(text('属性加成', { type: 'info', size: 'small' }));
    children.push(AttributeBonusList(attributeList));
    children.push(divider());
  }

  // 角色加成
  const characterList = event.getCharacterList();
  if (Object.keys(characterList).length > 0) {
    children.push(text('角色加成', { type: 'info', size: 'small' }));
    children.push(CharacterBonusList(characterList));
  }

  // 偏科加成
  if (event.eventCharacterParameterBonus && Object.keys(event.eventCharacterParameterBonus).length > 0) {
    const statNames: Record<string, string> = {
      performance: '演奏',
      technique: '技巧',
      visual: '形象'
    };

    const statItems: DescriptionsItem[] = [];
    for (const stat in event.eventCharacterParameterBonus) {
      const value = (event.eventCharacterParameterBonus as any)[stat];
      if (value && value > 0) {
        statItems.push({ label: statNames[stat] || stat, value: `+${value}%` });
      }
    }

    if (statItems.length > 0) {
      children.push(divider());
      children.push(text('偏科加成', { type: 'info', size: 'small' }));
      children.push(descriptions(statItems, { column: 3, size: 'small' }));
    }
  }

  return card(
    { header: '活动加成' },
    [space(children, { direction: 'vertical', size: 'small', fill: true })]
  );
}
