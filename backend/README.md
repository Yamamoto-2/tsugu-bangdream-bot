# Tsugu Backend v5

Schema 驱动的 BanG Dream 数据服务后端。

## 技术栈

- Express + TypeScript
- tsconfig-paths (`@/` 路径别名)
- ts-node-dev (开发热重载)

## 目录结构

```
src/
├── app.ts              # Express 入口
├── routes/             # API 路由
├── services/           # 业务服务层 (12个 Services)
├── schemas/            # Schema 构建
│   ├── types/          # Schema 类型定义 (ComponentName, CanvasCommand)
│   ├── core/           # 基础构建函数 (row, col, card, text, space, image...)
│   ├── components/     # 组件构建器 (CardIcon, EventBanner, BonusDisplay)
│   └── view/           # 页面 Schema 构建器 (eventDetail, eventPreview)
├── types/              # 领域类型 (Card, Event, Song, Player, Gacha...)
└── lib/                # 基础设施
    ├── clients/        # HTTP 客户端 (BestdoriClient)
    ├── cache/          # 缓存服务
    └── utils/          # 工具函数
```

## 开发

```bash
npm install
npm run dev    # 启动开发服务器 (localhost:3000)
```

## API 端点

| 路径 | 说明 |
|------|------|
| GET /event/:eventId | 获取活动详情 Schema |

## Schema 构建

后端不直接渲染，而是生成 JSON Schema 供前端渲染。

### 基础构建函数 (`schemas/core/base.ts`)

```typescript
import { row, col, card, text, space, image, tag, divider } from '@/schemas/core/base';

// 创建卡片
card({ header: '标题' }, [
  text('内容'),
  image('https://...')
]);

// 创建布局
row({ gutter: 16 }, [
  col({ span: 12 }, [...]),
  col({ span: 12 }, [...])
]);
```

### 组件构建器 (`schemas/components/`)

```typescript
import { CardIcon } from '@/schemas/components/CardIcon';

// CardIcon 返回 Canvas 组件的 Schema
const schema = CardIcon({
  card,
  trained: true,
  showId: true,
  size: 'medium'
});
```

### 页面构建器 (`schemas/view/`)

```typescript
import { buildEventDetailSchema } from '@/schemas/view/event/eventDetail';

const schema = buildEventDetailSchema(event, {
  server: 'jp',
  rewardCards: cards
});
```

## Canvas 指令

CardIcon 等组件生成 Canvas 绘图指令：

```typescript
type CanvasCommand =
  | { type: 'drawImage'; src: string; x: number; y: number; w: number; h: number }
  | { type: 'fillRect'; color: string; x: number; y: number; w: number; h: number }
  | { type: 'fillText'; text: string; x: number; y: number; font: string; color: string; ... }
  | { type: 'loop'; count: number; commands: CanvasCommand[]; offsetX?: number; offsetY?: number };
```

## 相关文档

- `../Tsugu-v5-设计文档.md` - 完整架构设计
