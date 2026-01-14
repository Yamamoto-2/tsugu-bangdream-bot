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
}, children: SchemaNode[], css?: Record<string, any>): SchemaNode {
  return { componentName: 'Page', props, children, ...(css && { css }) };
}

export function container(children: SchemaNode[], css?: Record<string, any>): SchemaNode {
  return { componentName: 'Container', children, ...(css && { css }) };
}

export function row(props: {
  gutter?: number;
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
  align?: 'top' | 'middle' | 'bottom';
} = {}, children: SchemaNode[], css?: Record<string, any>): SchemaNode {
  return { componentName: 'Row', props, children, ...(css && { css }) };
}

export function col(props: {
  span?: number;
  offset?: number;
  xs?: number | { span: number; offset?: number };
  sm?: number | { span: number; offset?: number };
  md?: number | { span: number; offset?: number };
  lg?: number | { span: number; offset?: number };
  xl?: number | { span: number; offset?: number };
}, children: SchemaNode[], css?: Record<string, any>): SchemaNode {
  return { componentName: 'Col', props, children, ...(css && { css }) };
}

export function space(children: SchemaNode[], props: {
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'default' | 'large' | number;
  wrap?: boolean;
  fill?: boolean;
  alignment?: 'center' | 'start' | 'end' | 'baseline' | 'stretch';
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Space', props, children, ...(css && { css }) };
}

// ========== 容器组件 ==========

export function card(props: {
  header?: string;
  shadow?: 'always' | 'hover' | 'never';
  bodyStyle?: Record<string, any>;
} = {}, children: SchemaNode[], css?: Record<string, any>): SchemaNode {
  return { componentName: 'Card', props, children, ...(css && { css }) };
}

// ========== 文本组件 ==========

export function text(content: string, props: {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'large' | 'default' | 'small';
  tag?: string;
  truncated?: boolean;
  lineClamp?: number;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Text', props: { content, ...props }, ...(css && { css }) };
}

export function title(content: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 2, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Title', props: { content, level }, ...(css && { css }) };
}

// ========== 媒体组件 ==========

export function image(src: string, props: {
  width?: string | number;
  height?: string | number;
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  alt?: string;
  lazy?: boolean;
  previewSrcList?: string[];
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Image', props: { src, ...props }, ...(css && { css }) };
}

// ========== 标签组件 ==========

export function tag(content: string, props: {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  effect?: 'dark' | 'light' | 'plain';
  size?: 'large' | 'default' | 'small';
  round?: boolean;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Tag', props: { content, ...props }, ...(css && { css }) };
}

// ========== 分割线 ==========

export function divider(props: {
  direction?: 'horizontal' | 'vertical';
  contentPosition?: 'left' | 'center' | 'right';
  borderStyle?: 'solid' | 'dashed' | 'dotted';
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Divider', props, ...(css && { css }) };
}

// ========== 数据展示 ==========

export function table(data: any[], columns: TableColumn[], props: {
  stripe?: boolean;
  border?: boolean;
  size?: 'large' | 'default' | 'small';
  showHeader?: boolean;
  maxHeight?: string | number;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Table', props: { data, columns, ...props }, ...(css && { css }) };
}

export function descriptions(items: DescriptionsItem[], props: {
  title?: string;
  column?: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'large' | 'default' | 'small';
  border?: boolean;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Descriptions', props: { items, ...props }, ...(css && { css }) };
}

export function chart(type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar', data: any, props: {
  options?: any;
  width?: number | string;
  height?: number | string;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Chart', props: { type, data, ...props }, ...(css && { css }) };
}

export function statistic(title: string, value: number | string, props: {
  precision?: number;
  prefix?: string;
  suffix?: string;
  valueStyle?: Record<string, any>;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Statistic', props: { title, value, ...props }, ...(css && { css }) };
}

// ========== 反馈组件 ==========

export function progress(percentage: number, props: {
  type?: 'line' | 'circle' | 'dashboard';
  strokeWidth?: number;
  status?: 'success' | 'exception' | 'warning';
  color?: string | string[] | { color: string; percentage: number }[];
  showText?: boolean;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Progress', props: { percentage, ...props }, ...(css && { css }) };
}

export function alert(title: string, props: {
  description?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  effect?: 'light' | 'dark';
  closable?: boolean;
  showIcon?: boolean;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Alert', props: { title, ...props }, ...(css && { css }) };
}

export function empty(props: {
  description?: string;
  image?: string;
  imageSize?: number;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Empty', props, ...(css && { css }) };
}

export function skeleton(props: {
  rows?: number;
  animated?: boolean;
  loading?: boolean;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Skeleton', props, ...(css && { css }) };
}

// ========== 链接 ==========

export function link(content: string, href: string, props: {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  underline?: boolean;
  icon?: string;
} = {}, css?: Record<string, any>): SchemaNode {
  return { componentName: 'Link', props: { content, href, ...props }, ...(css && { css }) };
}
