# Tsugu v5 Frontend

基于 Vue 3 + Element Plus 的通用 Schema 渲染器。

## 技术栈

- Vue 3 + TypeScript
- Element Plus
- Vite
- Chart.js

## 目录结构

```
src/
├── core/
│   ├── types.ts              # Schema 类型定义
│   └── SchemaRenderer.vue    # 核心渲染器
├── components/               # Ts* 组件
│   ├── TsPage.vue
│   ├── TsCard.vue
│   ├── TsCanvas.vue          # 通用画布组件
│   ├── TsText.vue
│   ├── TsImage.vue
│   ├── TsTable.vue
│   └── index.ts              # 组件注册表
├── views/                    # 页面视图
│   └── EventView.vue
└── App.vue
```

## 开发

```bash
npm install
npm run dev    # http://localhost:5173
```

## 组件列表 (21个)

| 组件 | 说明 | Element Plus |
|------|------|-------------|
| TsPage | 页面容器 | - |
| TsContainer | 响应式容器 | el-container |
| TsRow | 行布局 | el-row |
| TsCol | 列布局 | el-col |
| TsSpace | 间距容器 | el-space |
| TsCard | 卡片 | el-card |
| TsText | 文本 | el-text |
| TsTitle | 标题 | - |
| TsImage | 图片 | el-image |
| TsTag | 标签 | el-tag |
| TsDivider | 分割线 | el-divider |
| TsTable | 表格 | el-table |
| TsDescriptions | 描述列表 | el-descriptions |
| TsChart | 图表 | Chart.js |
| TsCanvas | **画布** | HTML Canvas |
| TsAlert | 提示 | el-alert |
| TsProgress | 进度条 | el-progress |
| TsStatistic | 统计数值 | el-statistic |
| TsEmpty | 空状态 | el-empty |
| TsSkeleton | 骨架屏 | el-skeleton |
| TsLink | 链接 | el-link |

## TsCanvas 组件

通用画布组件，执行后端发送的绘图指令。前端不包含业务逻辑，只负责渲染。

**支持的指令：**

```typescript
type CanvasCommand =
  | { type: 'drawImage'; src: string; x: number; y: number; w: number; h: number }
  | { type: 'fillRect'; color: string; x: number; y: number; w: number; h: number }
  | { type: 'fillText'; text: string; x: number; y: number; font: string; color: string; ... }
  | { type: 'loop'; count: number; commands: CanvasCommand[]; offsetX?: number; offsetY?: number };
```

## Schema 渲染

```vue
<template>
  <SchemaRenderer :node="schema" />
</template>

<script setup>
import SchemaRenderer from '@/core/SchemaRenderer.vue';

const schema = {
  componentName: 'Page',
  children: [
    {
      componentName: 'Card',
      props: { header: '标题' },
      children: [
        { componentName: 'Text', props: { content: '内容' } }
      ]
    }
  ]
};
</script>
```

## 静态资源

`public/assets/` 目录包含：
- `star.png` - 普通星星
- `star_trained.png` - 特训后星星

## 相关文档

- `../Tsugu-v5-设计文档.md` - 完整架构设计
