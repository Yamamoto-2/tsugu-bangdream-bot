# Tsugu 前端 Layout 设计

## 架构

全局 Layout 系统，通过 Vue Router 嵌套路由控制：

- **Web 模式** (`/`): DefaultLayout (sidebar + topbar + content)
- **Bot 模式** (`/bot/...`): 无 Layout，直接渲染 Schema

## 页面结构

```
┌──────────────────────────────────────────┐
│ SidebarProvider                          │
│ ┌──────────┬─────────────────────────────┤
│ │          │ Topbar                      │
│ │          │ [≡] / 首页 > 活动 > 详情    │
│ │ Sidebar  ├─────────────────────────────┤
│ │          │                             │
│ │ 信息     │   Content Area              │
│ │  活动    │   (SearchView / SchemaView)  │
│ │  歌曲    │                             │
│ │  卡牌    │                             │
│ │  角色    │                             │
│ │  乐队    │                             │
│ │  抽卡    │                             │
│ │  玩家    │                             │
│ │ 房间     │                             │
│ │  房间列表│                             │
│ └──────────┴─────────────────────────────┘
```

## Sidebar 导航

两个分组：
- **信息**: 活动、歌曲、卡牌、角色、乐队、抽卡、玩家（路径 `/info/...`）
- **房间**: 房间列表（路径 `/room`）

每个 sidebar 项为直接链接（无子菜单展开），点击直接导航到搜索列表页。
- 支持 `collapsible: 'icon'` 折叠为图标模式
- 移动端自动切换为 Sheet overlay
- Ctrl+B 快捷键切换 sidebar
- 当前路由匹配时高亮对应项

## 搜索列表页 (SearchView)

每个功能的入口页面，Schema 驱动的搜索+列表：
- 顶部：分类标题 + 图标
- 搜索栏 + 显示模式切换（表格/网格/大框）
- 搜索结果：后端返回 SchemaNode 树，前端 SchemaRenderer 渲染
- 无关键词时显示最近数据（如最近 50 个活动）
- 搜索 debounce 300ms
- 未实现的分类显示"即将上线"占位

流程: 搜索关键词 → POST /v1/{type}/list → 返回 Schema → 渲染结果 → 点击链接进入详情

## 详情页 (SchemaView)

从列表页点击具体项目进入详情，仍然是 Schema 驱动渲染。
- 活动详情: `/info/event/:eventId`
- 歌曲详情: `/info/song/:songId`

## 面包屑

- 始终以"首页"开头
- 通过路由 meta (`breadcrumb` + `parent`) 自动构建层级
- 示例: 首页 > 活动 > 活动详情
- 移动端只显示最后两级

## 路由结构

```
/ (DefaultLayout)
├── /                         → HomeView
├── /info/event               → SearchView (活动搜索列表)
├── /info/event/:eventId      → SchemaView (活动详情)
├── /info/song                → SearchView
├── /info/song/:songId        → SchemaView
├── /info/card                → SearchView (即将上线)
├── /info/character           → SearchView (即将上线)
├── /info/band                → SearchView (即将上线)
├── /info/gacha               → SearchView (即将上线)
├── /info/player              → SearchView (即将上线)
├── /room                     → SearchView (即将上线)
├── /demo                     → DemoView
└── /*                        → NotFoundView

/bot (无 Layout)
├── /bot/event/:eventId       → SchemaView
└── /bot/song/:songId         → SchemaView
```

旧路径自动重定向: `/event` → `/info/event`

## Bot 模式

- 路由前缀 `/bot/...`
- 无 sidebar、无 topbar
- 直接渲染 SchemaView

## API 版本

所有后端 API 使用 v1 前缀:
- `POST /v1/event/list` — 活动列表/搜索
- `POST /v1/event/detail` — 活动详情
- `POST /v1/event/preview` — 活动预览
- `POST /v1/song/detail` — 歌曲详情

## 技术栈

- shadcn-vue Sidebar + Breadcrumb + Sheet + Tooltip
- Vue Router 嵌套路由
- Lucide 图标
- Schema 驱动: 后端构建 SchemaNode 树，前端通用渲染
- 导航数据: `frontend/src/config/navigation.ts`
- 搜索列表: `frontend/src/views/SearchView.vue`
