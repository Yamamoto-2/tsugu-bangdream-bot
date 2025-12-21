# Tsugu v5 前端渲染器

基于 Vue 3 + TypeScript 的 Schema 驱动渲染器，用于将 Tsugu Schema 渲染为 Web UI。

## 功能特性

- ✅ Schema 驱动的组件渲染
- ✅ 完整的样式 token 系统
- ✅ 14 个基础组件（布局、UI、容器、图表）
- ✅ 组件注册机制，支持扩展
- ✅ 类型安全的 TypeScript 支持

## 已实现的基础组件

### 布局组件
- **Page**: 页面根容器，支持背景
- **Column**: 纵向堆叠布局
- **Row**: 横向排列布局
- **Spacer**: 空白间距
- **Wrap**: 自动换行的流式布局

### 基础 UI 组件
- **Text**: 自动换行文本
- **RichText**: 文字与图片混合显示
- **Image**: 图片显示
- **Badge**: 圆角标签
- **Divider**: 分隔线（虚线/实线）

### 容器组件
- **Card**: 带圆角背景的容器
- **Table**: 键值对列表行

### 图表组件
- **Chart**: 基于 Chart.js 的图表组件

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
npm run build
```

## 使用方式

### 1. 通过 Schema 渲染

```typescript
import SchemaRenderer from '@/core/SchemaRenderer.vue';
import { SchemaNode } from '@/core/types';

const schema: SchemaNode = {
  componentName: 'Page',
  props: {
    useEasyBG: true,
  },
  children: [
    {
      componentName: 'Column',
      children: [
        {
          componentName: 'Card',
          children: [
            {
              componentName: 'Text',
              props: {
                text: 'Hello, Tsugu!',
                textSize: 40,
              },
            },
          ],
        },
      ],
    },
  ],
};
```

### 2. Bot 端注入 Schema（用于截图）

```javascript
// Puppeteer 示例
await page.goto('http://localhost:5173');
await page.evaluate((schema, width) => {
  window.__TSUGU_SCHEMA__ = schema;
  window.__TSUGU_WIDTH__ = width;
  window.dispatchEvent(new CustomEvent('tsugu:render', { detail: { schema, width } }));
}, schema, 800);
await page.waitForSelector('[data-tsugu-rendered="true"]');
const screenshot = await page.screenshot({ type: 'png' });
```

### 3. 扩展组件

```typescript
import { ComponentRegistry } from '@/core/ComponentRegistry';
import MyCustomComponent from './MyCustomComponent.vue';

ComponentRegistry.register('MyCustom', MyCustomComponent);
```

## 组件 Props 参考

详细的组件 Props 定义请参考 `迁移计划.md` 中的组件清单。

## 样式 Token

- **尺寸**: `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px)
- **颜色**: `surface`, `primary`, `neutral`, `secondary`
- **变体**: `primary`, `secondary`, `neutral`, `surface`

## 项目结构

```
frontend/
├── src/
│   ├── core/              # 核心引擎
│   │   ├── types.ts       # Schema 类型定义
│   │   ├── ComponentRegistry.ts  # 组件注册表
│   │   ├── StyleMapper.ts # 样式映射系统
│   │   └── SchemaRenderer.vue  # 核心渲染器
│   ├── components/
│   │   ├── base/          # 基础组件
│   │   └── index.ts       # 组件导出和注册
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── package.json
└── vite.config.ts
```

## 迁移指南

从 `backend_old` 迁移到 Schema 渲染的映射关系，请参考 `迁移计划.md` 中的迁移映射表。

## 开发计划

- [ ] 实现 Title 组件
- [ ] 实现 Stack/Absolute 组件
- [ ] 支持 Canvas 命令渲染
- [ ] 添加更多样式 token
- [ ] 性能优化
- [ ] 单元测试

## 许可证

MIT


