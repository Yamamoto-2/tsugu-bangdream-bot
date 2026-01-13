/**
 * i18n 模块测试脚本
 * 运行: npx ts-node src/i18n/test.ts
 */

import { t, createTranslator, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './index';

console.log('=== i18n 模块测试 ===\n');

// 测试 1: 基本翻译
console.log('1. 基本翻译');
console.log(`  t('server.jp', 'zh') = "${t('server.jp', 'zh')}"`);  // 日服
console.log(`  t('server.jp', 'en') = "${t('server.jp', 'en')}"`);  // Japanese
console.log(`  t('server.jp', 'ja') = "${t('server.jp', 'ja')}"`);  // 日本版

// 测试 2: 嵌套 key
console.log('\n2. 嵌套 key');
console.log(`  t('event.type.story', 'zh') = "${t('event.type.story', 'zh')}"`);  // 普通活动
console.log(`  t('event.type.story', 'en') = "${t('event.type.story', 'en')}"`);  // Story Event
console.log(`  t('event.label.startTime', 'ja') = "${t('event.label.startTime', 'ja')}"`);  // 開始時間

// 测试 3: 插值参数
console.log('\n3. 插值参数');
console.log(`  t('event.time.remaining', 'zh', {days:3, hours:12}) = "${t('event.time.remaining', 'zh', { days: 3, hours: 12 })}"`);
console.log(`  t('event.time.remaining', 'en', {days:3, hours:12}) = "${t('event.time.remaining', 'en', { days: 3, hours: 12 })}"`);
console.log(`  t('common.percent', 'zh', {value:85}) = "${t('common.percent', 'zh', { value: 85 })}"`);

// 测试 4: createTranslator 工厂函数
console.log('\n4. createTranslator 工厂函数');
const $t_zh = createTranslator('zh');
const $t_en = createTranslator('en');
console.log(`  $t_zh('server.cn') = "${$t_zh('server.cn')}"`);  // 国服
console.log(`  $t_en('server.cn') = "${$t_en('server.cn')}"`);  // Chinese

// 测试 5: Fallback 机制（使用不存在的 key）
console.log('\n5. Fallback 机制');
console.log(`  t('nonexistent.key', 'en') = "${t('nonexistent.key', 'en')}"`);  // 应返回 key 本身

// 测试 6: 模拟实际使用场景
console.log('\n6. 模拟实际使用场景');
console.log('  场景: 中文 UI + 显示日服数据');

const $t = createTranslator('zh');
const mockEvent = {
  eventId: 123,
  eventName: ['ドリームフェスティバル', 'Dream Festival', null, '梦想祭典', null],  // [jp, en, tw, cn, kr]
};
const displayedServer = 0;  // jp

console.log(`  标签: ${$t('event.label.eventName')} -> 内容: ${mockEvent.eventName[displayedServer]}`);
console.log(`  标签: ${$t('event.label.server')} -> 内容: ${$t('server.jp')}`);

console.log('\n  场景: 英文 UI + 显示国服数据');
const $t_en2 = createTranslator('en');
const displayedServer2 = 3;  // cn

console.log(`  Label: ${$t_en2('event.label.eventName')} -> Content: ${mockEvent.eventName[displayedServer2]}`);
console.log(`  Label: ${$t_en2('event.label.server')} -> Content: ${$t_en2('server.cn')}`);

console.log('\n=== 测试完成 ===');
console.log(`支持的语言: ${SUPPORTED_LANGUAGES.join(', ')}`);
console.log(`默认语言: ${DEFAULT_LANGUAGE}`);
