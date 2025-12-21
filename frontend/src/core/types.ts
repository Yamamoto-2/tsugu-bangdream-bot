/**
 * Tsugu Schema 类型定义
 * 基于设计文档中的 Schema 规范
 */

export type ComponentName =
  | 'Page'
  | 'Column'
  | 'Row'
  | 'Spacer'
  | 'Wrap'
  | 'Text'
  | 'RichText'
  | 'Image'
  | 'Badge'
  | 'Divider'
  | 'Card'
  | 'Table'
  | 'ListRow'
  | 'Chart'
  | 'Title'
  | 'Stack';

export type StyleToken = 'sm' | 'md' | 'lg' | 'xl';
export type ColorToken = 'surface' | 'primary' | 'neutral' | 'secondary';
export type VariantToken = 'primary' | 'secondary' | 'neutral' | 'surface';

export interface Style {
  // 布局
  padding?: StyleToken | number | string;
  margin?: StyleToken | number | string;
  marginTop?: StyleToken | number | string;
  marginBottom?: StyleToken | number | string;
  marginLeft?: StyleToken | number | string;
  marginRight?: StyleToken | number | string;
  
  // 尺寸
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  minHeight?: number | string;
  
  // 背景
  background?: string;
  bg?: ColorToken | string;
  
  // 边框
  borderRadius?: StyleToken | number | string;
  border?: string;
  borderColor?: string;
  borderWidth?: number | string;
  
  // 文字
  fontSize?: StyleToken | number | string;
  color?: ColorToken | string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  // 布局相关
  gap?: StyleToken | number | string;
  align?: 'left' | 'center' | 'right' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  
  // 变体
  variant?: VariantToken;
  
  // 定位
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  
  // 透明度
  opacity?: number;
  
  // 其他
  [key: string]: any;
}

export interface SchemaNode {
  schemaVersion?: string;
  componentName: ComponentName;
  id?: string;
  props?: Record<string, any>;
  style?: Style;
  children?: SchemaNode[];
  slot?: string;
  layout?: {
    type?: 'grid' | 'flex' | 'column' | 'row';
    cols?: number;
    rows?: number;
    gap?: StyleToken | number | string;
  };
  renderHints?: {
    preferredOutput?: 'image' | 'html';
    maxWidth?: number;
    maxHeight?: number;
  };
  visible?: boolean;
  condition?: any;
}

export interface ComponentDefinition {
  name: ComponentName;
  props?: Record<string, {
    type: string;
    required?: boolean;
    default?: any;
    description?: string;
  }>;
  style?: Record<string, {
    type: string;
    enum?: any[];
    description?: string;
  }>;
  acceptsChildren?: boolean;
  slots?: string[];
}


