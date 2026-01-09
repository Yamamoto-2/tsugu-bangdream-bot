/**
 * Schema 节点构建器
 * 提供便捷的函数来创建 SchemaNode
 */

import { SchemaNode, TableColumn, DescriptionsItem } from '@/schemas/types';

// ========== 布局组件 ==========

export function page(props: {
  title?: string;
  background?: string;
  padding?: string | number;
}, children: SchemaNode[]): SchemaNode {
  return { componentName: 'Page', props, children };
}

export function container(children: SchemaNode[]): SchemaNode {
  return { componentName: 'Container', children };
}

export function row(props: {
  gutter?: number;
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
  align?: 'top' | 'middle' | 'bottom';
} = {}, children: SchemaNode[]): SchemaNode {
  return { componentName: 'Row', props, children };
}

export function col(props: {
  span?: number;
  offset?: number;
  xs?: number | { span: number; offset?: number };
  sm?: number | { span: number; offset?: number };
  md?: number | { span: number; offset?: number };
  lg?: number | { span: number; offset?: number };
  xl?: number | { span: number; offset?: number };
}, children: SchemaNode[]): SchemaNode {
  return { componentName: 'Col', props, children };
}

export function space(children: SchemaNode[], props: {
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'default' | 'large' | number;
  wrap?: boolean;
  fill?: boolean;
  alignment?: 'center' | 'start' | 'end' | 'baseline' | 'stretch';
} = {}): SchemaNode {
  return { componentName: 'Space', props, children };
}

// ========== 容器组件 ==========

export function card(props: {
  header?: string;
  shadow?: 'always' | 'hover' | 'never';
  bodyStyle?: Record<string, any>;
} = {}, children: SchemaNode[]): SchemaNode {
  return { componentName: 'Card', props, children };
}

// ========== 文本组件 ==========

export function text(content: string, props: {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'large' | 'default' | 'small';
  tag?: string;
  truncated?: boolean;
  lineClamp?: number;
} = {}): SchemaNode {
  return { componentName: 'Text', props: { content, ...props } };
}

export function title(content: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 2): SchemaNode {
  return { componentName: 'Title', props: { content, level } };
}

// ========== 媒体组件 ==========

export function image(src: string, props: {
  width?: string | number;
  height?: string | number;
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  alt?: string;
  lazy?: boolean;
  previewSrcList?: string[];
} = {}): SchemaNode {
  return { componentName: 'Image', props: { src, ...props } };
}

// ========== 标签组件 ==========

export function tag(content: string, props: {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  effect?: 'dark' | 'light' | 'plain';
  size?: 'large' | 'default' | 'small';
  round?: boolean;
} = {}): SchemaNode {
  return { componentName: 'Tag', props: { content, ...props } };
}

// ========== 分割线 ==========

export function divider(props: {
  direction?: 'horizontal' | 'vertical';
  contentPosition?: 'left' | 'center' | 'right';
  borderStyle?: 'solid' | 'dashed' | 'dotted';
} = {}): SchemaNode {
  return { componentName: 'Divider', props };
}

// ========== 数据展示 ==========

export function table(data: any[], columns: TableColumn[], props: {
  stripe?: boolean;
  border?: boolean;
  size?: 'large' | 'default' | 'small';
  showHeader?: boolean;
  maxHeight?: string | number;
} = {}): SchemaNode {
  return { componentName: 'Table', props: { data, columns, ...props } };
}

export function descriptions(items: DescriptionsItem[], props: {
  title?: string;
  column?: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'large' | 'default' | 'small';
  border?: boolean;
} = {}): SchemaNode {
  return { componentName: 'Descriptions', props: { items, ...props } };
}

export function chart(type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar', data: any, props: {
  options?: any;
  width?: number | string;
  height?: number | string;
} = {}): SchemaNode {
  return { componentName: 'Chart', props: { type, data, ...props } };
}

export function statistic(title: string, value: number | string, props: {
  precision?: number;
  prefix?: string;
  suffix?: string;
  valueStyle?: Record<string, any>;
} = {}): SchemaNode {
  return { componentName: 'Statistic', props: { title, value, ...props } };
}

// ========== 反馈组件 ==========

export function progress(percentage: number, props: {
  type?: 'line' | 'circle' | 'dashboard';
  strokeWidth?: number;
  status?: 'success' | 'exception' | 'warning';
  color?: string | string[] | { color: string; percentage: number }[];
  showText?: boolean;
} = {}): SchemaNode {
  return { componentName: 'Progress', props: { percentage, ...props } };
}

export function alert(title: string, props: {
  description?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  effect?: 'light' | 'dark';
  closable?: boolean;
  showIcon?: boolean;
} = {}): SchemaNode {
  return { componentName: 'Alert', props: { title, ...props } };
}

export function empty(props: {
  description?: string;
  image?: string;
  imageSize?: number;
} = {}): SchemaNode {
  return { componentName: 'Empty', props };
}

export function skeleton(props: {
  rows?: number;
  animated?: boolean;
  loading?: boolean;
} = {}): SchemaNode {
  return { componentName: 'Skeleton', props };
}

// ========== 链接 ==========

export function link(content: string, href: string, props: {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  underline?: boolean;
  icon?: string;
} = {}): SchemaNode {
  return { componentName: 'Link', props: { content, href, ...props } };
}
