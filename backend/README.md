# Tsugu Backend v5

Tsugu v5 后端服务 - Schema 驱动架构（非画图核心部分）

## 项目结构

```
backend/
├── src/
│   ├── lib/              # 基础设施库层（可复用、可测试）
│   │   ├── clients/      # 外部服务客户端
│   │   │   └── BestdoriClient.ts    # Bestdori API 统一客户端
│   │   ├── config/       # 配置加载器
│   │   │   └── runtime-loader.ts    # 统一配置入口
│   │   ├── download/     # 下载模块
│   │   │   ├── client.ts            # HTTP 客户端封装
│   │   │   ├── file-cache.ts        # 文件缓存 + ETag
│   │   │   ├── memory-cache.ts      # 内存缓存
│   │   │   └── service.ts           # 下载服务 API
│   │   ├── fuzzy-search/ # 模糊搜索模块
│   │   │   ├── parser.ts            # 关键字解析
│   │   │   ├── matcher.ts           # 匹配逻辑
│   │   │   ├── relation.ts          # 关系判断
│   │   │   ├── validator.ts         # 类型验证
│   │   │   └── index.ts             # 统一导出
│   │   ├── utils/        # 通用工具
│   │   │   ├── path-utils.ts        # 路径工具
│   │   │   ├── url-utils.ts         # URL 工具
│   │   │   ├── number.ts            # 数字工具
│   │   │   └── collections.ts      # 数据结构（Stack 等）
│   │   └── logger.ts     # 日志工具
│   ├── config/           # 配置层
│   │   ├── runtime.ts    # 运行时配置（路径、环境变量）
│   │   └── constants.ts # 业务常量（URL、服务器列表等）
│   ├── database/         # 数据库访问层
│   │   ├── IUserRepository.ts      # Repository 接口
│   │   └── MongoUserRepository.ts  # MongoDB 实现
│   ├── routes/           # 路由层（返回 Tsugu Schema）
│   │   ├── event.ts
│   │   └── song.ts
│   ├── schemas/          # Schema 构建层
│   │   ├── eventPreview.ts
│   │   └── songDetail.ts
│   ├── services/         # 业务服务层
│   │   ├── SongService.ts
│   │   ├── EventService.ts
│   │   ├── CutoffService.ts
│   │   └── GachaService.ts
│   ├── types/            # Domain 类型层
│   │   ├── Server.ts
│   │   ├── Song.ts
│   │   ├── Card.ts
│   │   ├── Event.ts
│   │   ├── User.ts
│   │   └── ...
│   └── app.ts            # 应用入口
├── tsconfig.json
└── package.json
```

## 已完成的工作

### ✅ 核心架构
- [x] 项目骨架初始化（tsconfig, package.json）
- [x] 模块职责分析与文档
- [x] Domain 类型迁移（**18个核心类型**：Song, Card, Event, Player, Gacha, Character, Band, AreaItem, Cutoff, Room, Skill, Attribute, Color, Server, User, Costume, Degree, Item）
- [x] API 层重组（BestdoriClient）
- [x] Config 拆分（runtime / constants）
- [x] 数据库层重构（Repository 模式）
- [x] **基础设施库层重构**（`/src/lib`）
  - [x] 下载模块迁移（`lib/download`）
  - [x] 日志模块迁移（`lib/logger`）
  - [x] 模糊搜索模块迁移（`lib/fuzzy-search`）
  - [x] 通用工具迁移（`lib/utils`）
  - [x] 外部客户端迁移（`lib/clients`）
  - [x] 配置加载器（`lib/config`）
- [x] **Services 层完整实现**（**12个Services**：SongService, EventService, GachaService, PlayerService, CutoffService, RoomService, CostumeService, DegreeService, ItemService, CardService, CharacterService, BandService）
- [x] Schema 构建层基础结构
- [x] 路由层基础结构（v5 接口）
- [x] 应用入口（app.ts）
- [x] **类型错误修复**（所有 TypeScript strict 模式错误已修复）
- [x] **依赖包安装**（express-validator, axios 等）

## 待完成的工作

### 🔄 需要进一步完善
1. ✅ ~~**Services 层实现**~~ - **已完成**（所有 Services 已完善实现，包含完整业务逻辑）
2. **Schema Builders**：根据 Tsugu v5 设计文档完善 Schema 构建函数
3. ✅ ~~**类型迁移**~~ - **核心类型已完成**（Player, Gacha, Character, Band, AreaItem, Costume, Degree, Item 等已迁移）
4. **依赖注入**：优化 BestdoriClient 和 Services 的依赖关系（可选优化）
5. **测试与验证**：编写测试脚本验证数据一致性
6. **路由实现**：完善路由层，集成 Services 和 Schema Builders

## 使用方法

### 安装依赖
```bash
cd backend
npm install
```

### 配置环境变量
创建 `.env` 文件：
```
BACKEND_PORT=3000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=tsugu
LOCAL_DB=true
ARTICLE=false
USE_BANDORISTATION=false
```

### 构建
```bash
npm run build
```

### 运行
```bash
npm start
# 或开发模式
npm run dev
```

## API 端点

### V5 接口（返回 Tsugu Schema）

- `POST /v5/event/preview` - 活动预览 Schema
- `POST /v5/event/detail` - 活动详情 Schema
- `POST /v5/song/detail` - 歌曲详情 Schema

### 健康检查
- `GET /health` - 服务健康状态

## 设计原则

1. **数据结构不变**：所有 Domain 类型保持与 Bestdori 数据完全一致的字段结构
2. **分层清晰**：Domain / API / Service / Schema / Route 各层职责明确
3. **无画图依赖**：核心逻辑不依赖 skia-canvas 或任何画图库
4. **Schema 驱动**：未来所有接口返回 Tsugu Schema，由前端/Vue 渲染

## 使用示例

### 下载模块
```typescript
import { downloadBinary, downloadJson } from '@/lib/download/service';

// 下载二进制文件
const buffer = await downloadBinary('https://example.com/image.png', {
    cacheTime: 3600000, // 1小时缓存
    retryCount: 3,
});

// 下载 JSON 数据
const data = await downloadJson('https://api.example.com/data.json', {
    cacheTime: Infinity, // 永久缓存
});
```

### 模糊搜索
```typescript
import { fuzzySearch, match, loadConfig } from '@/lib/fuzzy-search';

const config = loadConfig();
const result = fuzzySearch('keyword', config);
const matched = match(result, targetObject, ['id', 'level']);
```

### 日志
```typescript
import { logger } from '@/lib/logger';

logger('moduleName', 'Log message');
```

### 外部客户端
```typescript
import { BestdoriClient } from '@/lib/clients/BestdoriClient';

const client = new BestdoriClient();
const songs = await client.getAllSongs();
```

## 注意事项

- 部分类型构造函数仍依赖 mainAPI，已标记 TODO，未来应通过 BestdoriClient 获取
- ✅ **Services 层已完成**：所有 Services 已实现完整业务逻辑，包含数据缓存、错误处理等
- ✅ **基础设施库层已完成**：所有通用工具已迁移到 `/src/lib`，旧文件已删除
- Schema builders 目前是示例实现，需要根据 Tsugu v5 设计文档完善
- ✅ **类型错误已修复**：所有 TypeScript strict 模式下的类型错误已修复

## 相关文档

- `Tsugu-v5-设计文档.md` - Tsugu v5 整体设计
- `Tsugu-v5-backend-迁移步骤.md` - 迁移步骤文档
- `模块职责分析.md` - 模块职责边界分析
- `迁移进度-类型.md` - 类型迁移进度
- `迁移进度总结.md` - 整体进度总结


