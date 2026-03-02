/**
 * Tsugu Schema 类型定义
 * v2 - 基于 shadcn-vue + Tailwind CSS
 */

// 组件名称类型
export type ComponentName =
  | 'Page'           // 页面容器
  | 'Container'      // 响应式容器
  | 'Row'            // 行布局
  | 'Col'            // 列布局
  | 'Card'           // 卡片容器
  | 'Text'           // 文本显示
  | 'Title'          // 标题
  | 'Image'          // 图片
  | 'Tag'            // 标签
  | 'Divider'        // 分割线
  | 'Table'          // 表格
  | 'Descriptions'   // 描述列表
  | 'Chart'          // 图表
  | 'Space'          // 间距容器
  | 'Link'           // 链接
  | 'Alert'          // 提示
  | 'Statistic'      // 统计数值
  | 'Progress'       // 进度条
  | 'Empty'          // 空状态
  | 'Skeleton'       // 骨架屏
  | 'Canvas';        // Canvas 画布

// Schema 节点定义
export interface SchemaNode {
  componentName: ComponentName;
  id?: string;
  props?: Record<string, any>;
  /** 原生 CSS 样式，优先级高于 props 中的样式属性 */
  css?: Record<string, any>;
  children?: SchemaNode[];
  visible?: boolean;
}

// 各组件 Props 类型定义

export interface PageProps {
  background?: string;
  padding?: string | number;
}

export interface ContainerProps {
  // 无特殊 props
}

export interface RowProps {
  gutter?: number;
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
  align?: 'top' | 'middle' | 'bottom';
}

export interface ColProps {
  span?: number;        // 1-24
  offset?: number;
  push?: number;
  pull?: number;
  xs?: number | { span: number; offset?: number };
  sm?: number | { span: number; offset?: number };
  md?: number | { span: number; offset?: number };
  lg?: number | { span: number; offset?: number };
  xl?: number | { span: number; offset?: number };
}

export interface CardProps {
  header?: string;
  shadow?: 'always' | 'hover' | 'never';
  bodyStyle?: Record<string, any>;
}

export interface TextProps {
  content?: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'large' | 'default' | 'small';
  tag?: string;
  truncated?: boolean;
  lineClamp?: number;
}

export interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  content?: string;
}

export interface ImageProps {
  src?: string;
  width?: string | number;
  height?: string | number;
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  alt?: string;
  lazy?: boolean;
  previewSrcList?: string[];
}

export interface TagProps {
  content?: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  effect?: 'dark' | 'light' | 'plain';
  size?: 'large' | 'default' | 'small';
  round?: boolean;
}

export interface DividerProps {
  direction?: 'horizontal' | 'vertical';
  contentPosition?: 'left' | 'center' | 'right';
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface TableColumn {
  prop: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: boolean | 'left' | 'right';
}

export interface TableProps {
  data?: any[];
  columns?: TableColumn[];
  stripe?: boolean;
  border?: boolean;
  size?: 'large' | 'default' | 'small';
  showHeader?: boolean;
  maxHeight?: string | number;
}

export interface DescriptionsItem {
  label: string;
  value: string | number;
  span?: number;
}

export interface DescriptionsProps {
  title?: string;
  items?: DescriptionsItem[];
  column?: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'large' | 'default' | 'small';
  border?: boolean;
}

export interface ChartProps {
  type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  data?: any;
  options?: any;
  width?: number | string;
  height?: number | string;
}

export interface SpaceProps {
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'default' | 'large' | number;
  wrap?: boolean;
  fill?: boolean;
  alignment?: 'center' | 'start' | 'end' | 'baseline' | 'stretch';
}

export interface LinkProps {
  content?: string;
  href?: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  underline?: boolean;
  icon?: string;
}

export interface AlertProps {
  title?: string;
  description?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  effect?: 'light' | 'dark';
  closable?: boolean;
  showIcon?: boolean;
}

export interface StatisticProps {
  title?: string;
  value?: number | string;
  precision?: number;
  prefix?: string;
  suffix?: string;
  valueStyle?: Record<string, any>;
}

export interface ProgressProps {
  percentage?: number;
  type?: 'line' | 'circle' | 'dashboard';
  strokeWidth?: number;
  status?: 'success' | 'exception' | 'warning';
  color?: string | string[] | { color: string; percentage: number }[];
  showText?: boolean;
  format?: (percentage: number) => string;
}

export interface EmptyProps {
  description?: string;
  image?: string;
  imageSize?: number;
}

export interface SkeletonProps {
  rows?: number;
  animated?: boolean;
  loading?: boolean;
}

// Canvas 指令类型
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
