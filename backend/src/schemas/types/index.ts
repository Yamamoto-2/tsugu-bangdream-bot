/**
 * Tsugu Schema 类型定义
 * 纯类型，不包含任何实现
 */

// ========== 组件名称 ==========

export type ComponentName =
  | 'Page'
  | 'Container'
  | 'Row'
  | 'Col'
  | 'Card'
  | 'Text'
  | 'Title'
  | 'Image'
  | 'Tag'
  | 'Divider'
  | 'Table'
  | 'Descriptions'
  | 'Chart'
  | 'Space'
  | 'Link'
  | 'Alert'
  | 'Statistic'
  | 'Progress'
  | 'Empty'
  | 'Skeleton';

// ========== Schema 节点 ==========

export interface SchemaNode {
  componentName: ComponentName;
  id?: string;
  props?: Record<string, any>;
  style?: Record<string, any>;
  children?: SchemaNode[];
  visible?: boolean;
}

// ========== 构建器配置 ==========

export interface SchemaBuilderConfig {
  imageMode?: 'url' | 'base64';
  server?: string;
  language?: 'zh' | 'en' | 'ja';
}

// ========== 组件 Props 类型 ==========

export interface TableColumn {
  prop: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: boolean | 'left' | 'right';
}

export interface DescriptionsItem {
  label: string;
  value: string | number;
  span?: number;
}

// ========== 服务器类型 ==========

export type ServerKey = 'jp' | 'en' | 'tw' | 'cn' | 'kr';
