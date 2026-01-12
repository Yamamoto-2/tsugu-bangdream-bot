# Tsugu v5 设计文档

## 1. 项目概述

Tsugu v5 采用 **Schema 驱动渲染** 架构，后端生成 JSON Schema，前端统一渲染。

**核心优势：**
- 后端专注业务逻辑，不包含渲染细节
- 前端通用化，可复用到其他项目
- 为 LLM 生成 Schema 预留接口

## 2. 项目结构

```
tsugu-bangdream-bot/
├── backend/          # 后端 - Express + TypeScript
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 业务服务层
│   │   ├── schemas/      # Schema 构建器
│   │   │   ├── types/        # Schema 类型定义
│   │   │   ├── core/         # 基础构建函数
│   │   │   ├── components/   # 组件构建器 (CardIcon, EventBanner 等)
│   │   │   └── view/         # 页面 Schema 构建器 (eventDetail 等)
│   │   ├── types/        # 领域类型 (Card, Event, Song 等)
│   │   └── lib/          # 基础设施 (缓存、HTTP 客户端等)
│   └── cache/            # 数据缓存目录
├── frontend/         # 前端 - Vue 3 + Element Plus + Vite
│   ├── src/
│   │   ├── core/         # 核心渲染器
│   │   │   ├── types.ts      # Schema 类型定义
│   │   │   └── SchemaRenderer.vue  # 通用 Schema 渲染器
│   │   ├── components/   # Ts* 组件 (TsCard, TsCanvas 等)
│   │   └── views/        # 页面视图
│   └── public/assets/    # 静态资源 (星星图片等)
├── koishi_plugin/    # Koishi Bot 插件
└── backend_old/      # 旧版后端 (Skia 画图，待废弃)
```

## 3. Schema 规范

### 3.1 基础结构

```typescript
interface SchemaNode {
  componentName: ComponentName;  // 组件名称
  id?: string;                   // 节点 ID
  props?: Record<string, any>;   // 组件属性
  style?: Record<string, any>;   // 样式属性
  children?: SchemaNode[];       // 子节点
  visible?: boolean;             // 显隐控制
}
```

### 3.2 组件列表

| 组件名 | 说明 | 对应前端 |
|--------|------|----------|
| Page | 页面容器 | TsPage.vue |
| Container | 响应式容器 | TsContainer.vue |
| Row | 行布局 | TsRow.vue (el-row) |
| Col | 列布局 | TsCol.vue (el-col) |
| Space | 间距容器 | TsSpace.vue (el-space) |
| Card | 卡片 | TsCard.vue (el-card) |
| Text | 文本 | TsText.vue (el-text) |
| Title | 标题 | TsTitle.vue |
| Image | 图片 | TsImage.vue (el-image) |
| Tag | 标签 | TsTag.vue (el-tag) |
| Divider | 分割线 | TsDivider.vue (el-divider) |
| Table | 表格 | TsTable.vue (el-table) |
| Descriptions | 描述列表 | TsDescriptions.vue |
| Chart | 图表 | TsChart.vue (Chart.js) |
| Canvas | 画布 | TsCanvas.vue |
| Alert | 提示 | TsAlert.vue |
| Progress | 进度条 | TsProgress.vue |
| Statistic | 统计数值 | TsStatistic.vue |
| Empty | 空状态 | TsEmpty.vue |
| Skeleton | 骨架屏 | TsSkeleton.vue |
| Link | 链接 | TsLink.vue |

### 3.3 Canvas 组件

Canvas 是通用画布组件，接收绘图指令并执行。后端控制所有渲染细节，前端只负责执行。

**类型定义：**
```typescript
type CanvasCommand =
  | { type: 'drawImage'; src: string; x: number; y: number; w: number; h: number }
  | { type: 'fillRect'; color: string; x: number; y: number; w: number; h: number }
  | { type: 'fillText'; text: string; x: number; y: number; font: string; color: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline }
  | { type: 'loop'; count: number; commands: CanvasCommand[]; offsetX?: number; offsetY?: number };

interface CanvasProps {
  width: number;
  height: number;
  commands: CanvasCommand[];
}
```

**示例 - CardIcon 生成的 Canvas：**
```json
{
  "componentName": "Canvas",
  "props": {
    "width": 120,
    "height": 120,
    "commands": [
      { "type": "drawImage", "src": "https://bestdori.com/.../card.png", "x": 0, "y": 0, "w": 120, "h": 120 },
      { "type": "drawImage", "src": "https://bestdori.com/.../frame.png", "x": 0, "y": 0, "w": 120, "h": 120 },
      { "type": "drawImage", "src": "https://bestdori.com/.../cool.svg", "x": 88, "y": 2, "w": 30, "h": 30 },
      { "type": "drawImage", "src": "/assets/star_trained.png", "x": 2, "y": 100, "w": 18, "h": 18 }
    ]
  }
}
```

## 4. 后端架构

### 4.1 目录结构

```
backend/src/
├── app.ts                    # Express 入口
├── routes/                   # API 路由
│   ├── event.ts              # /event/:eventId
│   └── ...
├── services/                 # 业务服务
│   ├── EventService.ts
│   ├── CardService.ts
│   └── ...
├── schemas/                  # Schema 构建
│   ├── types/index.ts        # 类型定义
│   ├── core/base.ts          # 基础构建函数 (row, col, card, text, space, image...)
│   ├── components/           # 组件构建器
│   │   ├── CardIcon.ts       # 卡牌图标 -> Canvas
│   │   ├── EventBanner.ts    # 活动横幅 -> Image
│   │   ├── AttributeTag.ts   # 属性标签
│   │   ├── CharacterIcon.ts  # 角色图标
│   │   └── BonusDisplay.ts   # 加成显示
│   └── view/                 # 页面构建器
│       └── event/
│           ├── eventDetail.ts
│           └── eventPreview.ts
├── types/                    # 领域类型
│   ├── Card.ts
│   ├── Event.ts
│   └── ...
└── lib/                      # 基础设施
    ├── clients/              # HTTP 客户端
    ├── cache/                # 缓存服务
    └── utils/                # 工具函数
```

### 4.2 Schema 构建示例

```typescript
// schemas/components/CardIcon.ts
export function CardIcon(props: CardIconProps): SchemaNode {
  const { card, trained, showId, size, server } = props;
  const commands: CanvasCommand[] = [];

  // 绘制卡面
  commands.push({
    type: 'drawImage',
    src: getCardIconUrl(card, trained, server),
    x: 0, y: 0, w: width, h: height
  });

  // 绘制边框、属性、乐队、星星...

  const canvas: SchemaNode = {
    componentName: 'Canvas',
    props: { width, height, commands }
  };

  if (!showId) return canvas;

  // 用 Space 包裹 Canvas 和 ID 文字
  return space([
    canvas,
    text(`#${card.cardId}`, { size: 'small' })
  ], { direction: 'vertical', alignment: 'center' });
}
```

### 4.3 路由示例

```typescript
// routes/event.ts
router.get('/:eventId', async (req, res) => {
  const event = await eventService.getEventById(eventId);
  const rewardCards = await cardService.getCardsByIds(event.rewardCards);

  const schema = buildEventDetailSchema(event, { rewardCards, server });
  res.json(schema);
});
```

## 5. 前端架构

### 5.1 SchemaRenderer

核心渲染器，递归渲染 Schema 树：

```vue
<!-- core/SchemaRenderer.vue -->
<template>
  <component
    :is="componentMap[node.componentName]"
    v-bind="node.props"
    :style="node.style"
  >
    <template v-if="node.children">
      <SchemaRenderer
        v-for="(child, index) in node.children"
        :key="child.id || index"
        :node="child"
      />
    </template>
  </component>
</template>
```

### 5.2 TsCanvas 组件

通用画布组件，执行后端发送的绘图指令：

```typescript
// 执行单条指令
async function executeCommand(ctx, cmd, offsetX = 0, offsetY = 0) {
  switch (cmd.type) {
    case 'drawImage':
      const img = await loadImage(cmd.src);
      ctx.drawImage(img, cmd.x + offsetX, cmd.y + offsetY, cmd.w, cmd.h);
      break;
    case 'fillText':
      ctx.fillStyle = cmd.color;
      ctx.font = cmd.font;
      ctx.textAlign = cmd.align || 'left';
      ctx.fillText(cmd.text, cmd.x + offsetX, cmd.y + offsetY);
      break;
    case 'fillRect':
      ctx.fillStyle = cmd.color;
      ctx.fillRect(cmd.x + offsetX, cmd.y + offsetY, cmd.w, cmd.h);
      break;
    case 'loop':
      for (let i = 0; i < cmd.count; i++) {
        for (const subCmd of cmd.commands) {
          await executeCommand(ctx, subCmd,
            offsetX + (cmd.offsetX || 0) * i,
            offsetY + (cmd.offsetY || 0) * i
          );
        }
      }
      break;
  }
}
```

## 6. 数据流

```
用户请求 -> Bot/Web 前端
              ↓
         后端 API (/event/123)
              ↓
         Service 层 (获取 Event, Card 数据)
              ↓
         Schema Builder (buildEventDetailSchema)
              ↓
         返回 JSON Schema
              ↓
         前端 SchemaRenderer 渲染
              ↓
         TsCanvas 执行绘图指令
              ↓
         显示结果
```

## 7. 开发指南

### 7.1 启动开发环境

```bash
# 后端
cd backend
npm install
npm run dev  # http://localhost:3000

# 前端
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### 7.2 添加新组件

1. **后端** - 在 `schemas/components/` 创建组件构建函数
2. **前端** - 在 `components/` 创建 Vue 组件，在 `index.ts` 注册

### 7.3 添加新页面

1. **后端** - 在 `schemas/view/` 创建页面 Schema 构建函数
2. **后端** - 在 `routes/` 添加路由
3. **前端** - 在 `views/` 创建页面视图（如需要）

## 8. 当前进度

### 已完成
- [x] 后端基础架构 (Express, TypeScript, tsconfig-paths)
- [x] Schema 类型定义和基础构建函数
- [x] 前端 Schema 渲染器和组件库
- [x] Canvas 通用画布组件
- [x] CardIcon 组件 (Canvas 指令模式)
- [x] EventDetail 页面 Schema
- [x] 属性/角色加成显示组件

### 进行中
- [ ] Song 相关页面
- [ ] Gacha 相关页面
- [ ] Player 相关页面

### 待开发
- [ ] Bot 端无头浏览器截图
- [ ] LLM Schema 生成接口
