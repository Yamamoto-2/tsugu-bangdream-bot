/**
 * 组件导出
 * 所有基础组件在这里统一导出并注册
 */

import { ComponentRegistry } from '@/core/ComponentRegistry';
import { ComponentName } from '@/core/types';

// 导入组件
import Page from './base/Page.vue';
import Column from './base/Column.vue';
import Row from './base/Row.vue';
import Spacer from './base/Spacer.vue';
import Wrap from './base/Wrap.vue';
import Text from './base/Text.vue';
import RichText from './base/RichText.vue';
import Image from './base/Image.vue';
import Badge from './base/Badge.vue';
import Divider from './base/Divider.vue';
import Card from './base/Card.vue';
import Table from './base/Table.vue';
import Chart from './base/Chart.vue';

// 注册组件
ComponentRegistry.register('Page', Page);
ComponentRegistry.register('Column', Column);
ComponentRegistry.register('Row', Row);
ComponentRegistry.register('Spacer', Spacer);
ComponentRegistry.register('Wrap', Wrap);
ComponentRegistry.register('Text', Text);
ComponentRegistry.register('RichText', RichText);
ComponentRegistry.register('Image', Image);
ComponentRegistry.register('Badge', Badge);
ComponentRegistry.register('Divider', Divider);
ComponentRegistry.register('Card', Card);
ComponentRegistry.register('Table', Table);
ComponentRegistry.register('Chart', Chart);

// 导出组件（供外部使用）
export {
  Page,
  Column,
  Row,
  Spacer,
  Wrap,
  Text,
  RichText,
  Image,
  Badge,
  Divider,
  Card,
  Table,
  Chart,
};


