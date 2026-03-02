/**
 * BonusDisplay 组件
 * 统一显示活动加成（属性加成 + 角色加成 + 偏科加成）
 */

import { SchemaNode, DescriptionsItem } from '@/schemas/types';
import { card, space, text, divider, descriptions } from '@/schemas/core/base';
import { AttributeBonusList } from '@/schemas/components/AttributeTag';
import { CharacterBonusList } from '@/schemas/components/CharacterIcon';
import { Event } from '@/types/Event';
import { createTranslator, Language, DEFAULT_LANGUAGE } from '@/i18n';

export interface BonusDisplayProps {
  event: Event;
  language?: Language;
}

/**
 * 构建活动加成显示组件（不包含卡片包装）
 * 返回一个 SchemaNode 数组，可以嵌入到其他容器中
 */
export function BonusDisplay(props: BonusDisplayProps): SchemaNode[] {
  const { event, language = DEFAULT_LANGUAGE } = props;
  const $t = createTranslator(language);
  const children: SchemaNode[] = [];

  // 属性加成
  const attributeList = event.getAttributeList();
  if (Object.keys(attributeList).length > 0) {
    children.push(divider());
    children.push(
      space([
        text($t('bonus.attribute'), { type: 'info' }),
        AttributeBonusList(attributeList)
      ], { size: 'default', alignment: 'center' })
    );
  }

  // 角色加成
  const characterList = event.getCharacterList();
  if (Object.keys(characterList).length > 0) {
    children.push(divider());
    children.push(
      space([
        text($t('bonus.character'), { type: 'info' }),
        CharacterBonusList(characterList)
      ], { size: 'default', alignment: 'center' })
    );
  }

  // 偏科加成
  if (event.eventCharacterParameterBonus && Object.keys(event.eventCharacterParameterBonus).length > 0) {
    const statParts: string[] = [];
    for (const stat in event.eventCharacterParameterBonus) {
      if (stat === 'eventId') continue;
      const value = (event.eventCharacterParameterBonus as any)[stat];
      if (value && value > 0) {
        const statName = $t(`bonus.stat.${stat}`);
        statParts.push(`${statName} +${value}%`);
      }
    }

    if (statParts.length > 0) {
      children.push(divider());
      children.push(
        space([
          text($t('bonus.allFit'), { type: 'info' }),
          text(statParts.join('  '))
        ], { size: 'default', alignment: 'center' })
      );
    }
  }

  return children;
}
