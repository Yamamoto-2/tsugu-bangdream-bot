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
  | 'Skeleton'
  | 'Canvas';

// ========== Canvas 指令类型 ==========

export type CanvasCommand =
  | { type: 'drawImage'; src: string; x: number; y: number; w: number; h: number }
  | { type: 'fillRect'; color: string; x: number; y: number; w: number; h: number }
  | { type: 'fillText'; text: string; x: number; y: number; font: string; color: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline }
  | { type: 'loop'; count: number; commands: CanvasCommand[]; offsetX?: number; offsetY?: number };

export interface CanvasProps {
  width: number;
  height: number;
  commands: CanvasCommand[];
}

// ========== Schema 节点 ==========

export interface SchemaNode {
  componentName: ComponentName;
  id?: string;
  props?: Record<string, any>;
  /** 原生 CSS 样式，优先级高于 props 中的样式属性 */
  css?: Record<string, any>;
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
