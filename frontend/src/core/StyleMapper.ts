/**
 * 样式映射系统
 * 将抽象的样式 token 映射为实际的 CSS 值
 */

import { Style, StyleToken, ColorToken, VariantToken } from './types';

// 样式 token 到实际值的映射
const TOKEN_MAP: Record<StyleToken, number> = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// 颜色 token 映射
const COLOR_MAP: Record<ColorToken, string> = {
  surface: '#ffffff',
  primary: '#ea4e73',
  neutral: '#5b5b5b',
  secondary: '#a8a8a8',
};

// 变体颜色映射
const VARIANT_COLOR_MAP: Record<VariantToken, { bg: string; text: string }> = {
  primary: { bg: '#ea4e73', text: '#ffffff' },
  secondary: { bg: '#a8a8a8', text: '#ffffff' },
  neutral: { bg: '#5b5b5b', text: '#ffffff' },
  surface: { bg: '#ffffff', text: '#505050' },
};

export class StyleMapper {
  /**
   * 将 token 转换为实际值
   */
  static tokenToValue(token: StyleToken | number | string | undefined): number | string | undefined {
    if (token === undefined) return undefined;
    if (typeof token === 'number') return token;
    if (typeof token === 'string' && token.endsWith('px')) return token;
    if (typeof token === 'string' && token in TOKEN_MAP) {
      return TOKEN_MAP[token as StyleToken];
    }
    return token;
  }

  /**
   * 将颜色 token 转换为实际颜色值
   */
  static colorTokenToValue(token: ColorToken | string | undefined): string | undefined {
    if (token === undefined) return undefined;
    if (token in COLOR_MAP) {
      return COLOR_MAP[token as ColorToken];
    }
    return token;
  }

  /**
   * 获取变体颜色
   */
  static getVariantColors(variant: VariantToken | undefined): { bg: string; text: string } | undefined {
    if (variant === undefined) return undefined;
    return VARIANT_COLOR_MAP[variant];
  }

  /**
   * 将 Schema Style 转换为 CSS 样式对象
   */
  static styleToCSS(style: Style | undefined): Record<string, string> {
    if (!style) return {};

    const css: Record<string, string> = {};

    // 处理 padding
    if (style.padding !== undefined) {
      const padding = this.tokenToValue(style.padding);
      css.padding = typeof padding === 'number' ? `${padding}px` : String(padding);
    }

    // 处理 margin
    if (style.margin !== undefined) {
      const margin = this.tokenToValue(style.margin);
      css.margin = typeof margin === 'number' ? `${margin}px` : String(margin);
    }
    if (style.marginTop !== undefined) {
      const margin = this.tokenToValue(style.marginTop);
      css.marginTop = typeof margin === 'number' ? `${margin}px` : String(margin);
    }
    if (style.marginBottom !== undefined) {
      const margin = this.tokenToValue(style.marginBottom);
      css.marginBottom = typeof margin === 'number' ? `${margin}px` : String(margin);
    }
    if (style.marginLeft !== undefined) {
      const margin = this.tokenToValue(style.marginLeft);
      css.marginLeft = typeof margin === 'number' ? `${margin}px` : String(margin);
    }
    if (style.marginRight !== undefined) {
      const margin = this.tokenToValue(style.marginRight);
      css.marginRight = typeof margin === 'number' ? `${margin}px` : String(margin);
    }

    // 处理尺寸
    if (style.width !== undefined) {
      css.width = typeof style.width === 'number' ? `${style.width}px` : String(style.width);
    }
    if (style.height !== undefined) {
      css.height = typeof style.height === 'number' ? `${style.height}px` : String(style.height);
    }
    if (style.maxWidth !== undefined) {
      css.maxWidth = typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : String(style.maxWidth);
    }
    if (style.minWidth !== undefined) {
      css.minWidth = typeof style.minWidth === 'number' ? `${style.minWidth}px` : String(style.minWidth);
    }
    if (style.maxHeight !== undefined) {
      css.maxHeight = typeof style.maxHeight === 'number' ? `${style.maxHeight}px` : String(style.maxHeight);
    }
    if (style.minHeight !== undefined) {
      css.minHeight = typeof style.minHeight === 'number' ? `${style.minHeight}px` : String(style.minHeight);
    }

    // 处理背景
    if (style.background !== undefined) {
      css.background = style.background;
    } else if (style.bg !== undefined) {
      const bgColor = this.colorTokenToValue(style.bg);
      if (bgColor) {
        css.backgroundColor = bgColor;
      }
    }

    // 处理边框
    if (style.borderRadius !== undefined) {
      const radius = this.tokenToValue(style.borderRadius);
      css.borderRadius = typeof radius === 'number' ? `${radius}px` : String(radius);
    }
    if (style.border !== undefined) {
      css.border = style.border;
    }
    if (style.borderColor !== undefined) {
      css.borderColor = style.borderColor;
    }
    if (style.borderWidth !== undefined) {
      css.borderWidth = typeof style.borderWidth === 'number' ? `${style.borderWidth}px` : String(style.borderWidth);
    }

    // 处理文字
    if (style.fontSize !== undefined) {
      const fontSize = this.tokenToValue(style.fontSize);
      css.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : String(fontSize);
    }
    if (style.color !== undefined) {
      const color = this.colorTokenToValue(style.color);
      if (color) {
        css.color = color;
      }
    }
    if (style.fontWeight !== undefined) {
      css.fontWeight = String(style.fontWeight);
    }
    if (style.textAlign !== undefined) {
      css.textAlign = style.textAlign;
    }

    // 处理布局
    if (style.gap !== undefined) {
      const gap = this.tokenToValue(style.gap);
      css.gap = typeof gap === 'number' ? `${gap}px` : String(gap);
    }
    if (style.align !== undefined) {
      css.alignItems = style.align === 'left' ? 'flex-start' : 
                       style.align === 'right' ? 'flex-end' : 
                       style.align === 'center' ? 'center' : 'stretch';
    }
    if (style.justify !== undefined) {
      css.justifyContent = style.justify === 'start' ? 'flex-start' :
                           style.justify === 'end' ? 'flex-end' :
                           style.justify === 'center' ? 'center' :
                           style.justify === 'space-between' ? 'space-between' :
                           style.justify === 'space-around' ? 'space-around' : 'flex-start';
    }

    // 处理定位
    if (style.position !== undefined) {
      css.position = style.position;
    }
    if (style.top !== undefined) {
      css.top = typeof style.top === 'number' ? `${style.top}px` : String(style.top);
    }
    if (style.right !== undefined) {
      css.right = typeof style.right === 'number' ? `${style.right}px` : String(style.right);
    }
    if (style.bottom !== undefined) {
      css.bottom = typeof style.bottom === 'number' ? `${style.bottom}px` : String(style.bottom);
    }
    if (style.left !== undefined) {
      css.left = typeof style.left === 'number' ? `${style.left}px` : String(style.left);
    }

    // 处理透明度
    if (style.opacity !== undefined) {
      css.opacity = String(style.opacity);
    }

    return css;
  }
}


