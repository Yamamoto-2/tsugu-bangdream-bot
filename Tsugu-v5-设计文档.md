## Tsugu v5 设计文档

### 0. 背景与目标

Tsugu v5 的目标是将当前「Koishi 插件 + Skia 画图后端」的架构，升级为一个 **Schema 驱动、多端共享渲染逻辑** 的系统，为后续「自然语言 → LLM 生成 Schema → 自动排版」打基础。

核心变化：

- **从“直接画图”改为“生成视图 Schema”**：后端不再直接使用 Skia 画图，而是输出一个描述页面结构的 JSON Schema。
- **前端与 Bot 共用一套渲染协议**：Web 前端与 Bot 端都根据同一个 Schema 渲染内容。
- **为 LLM 预留接口**：未来可以通过 LLM 根据用户的自然语言请求，自动生成 Tsugu Schema，从而灵活调用各类组件与布局。

本版本代号：**Tsugu v5**。

---

### 1. 整体架构

Tsugu v5 拆分为三个主要项目 / 子系统：

- **Bot 端（Koishi 插件 / 其他前端插件）**
  - 接收用户指令 / 消息。
  - 调用后端 API，获取对应指令的 **视图 Schema**。
  - 将 Schema 交给渲染层（例如通过无头浏览器复用 Web 前端），输出为图片 / 消息。

- **网页前端（Web 前端 / Vue 应用）**
  - 基于 Vue 组件实现 Tsugu 的各种页面与 UI 组件。
  - 根据访问路径从后端拉取当前路由对应的 Schema，或在 `/` 路径下接收外部 POST / 参数传入的 Schema。
  - 将 Schema 渲染为可交互的网页界面。

- **后端（核心服务 / API 层）**
  - 处理业务逻辑、数据查询与聚合。
  - 不直接画图，而是生成 **Tsugu Schema**（页面结构 + 组件树 + 可选画图命令）。
  - 对外暴露统一的 HTTP API，供 Bot 与 Web 前端调用。

数据流向示意：

1. 用户 → Bot / Web 前端（自然语言 / 指令）
2. Bot / 前端 → 后端（结构化请求：例如 eventId、tier、server 等）
3. 后端 → 返回 Tsugu Schema（JSON）
4. 前端 / Bot 渲染器 → 根据 Schema 渲染 UI 或图片
5. （未来）可插入 LLM：自然语言 → LLM 生成 Tsugu Schema → 渲染

---

### 2. Tsugu Schema 概述

Tsugu v5 中，前端与 Bot 端都以一棵 **组件树（Component Tree）** 为核心，这棵树由 JSON Schema 描述。  
每一个节点对应一个组件实例，例如：页面、卡片、活动概要、画布等。

顶层是一个根节点，一般为 `componentName: "Page"`：

```json
{
  "schemaVersion": "1.0",
  "componentName": "Page",
  "id": "event-page-123",
  "props": {
    "title": "活动 123 概览"
  },
  "style": {
    "background": "surface"
  },
  "children": [
    {
      "componentName": "Card",
      "id": "event-summary-card",
      "props": {
        "title": "活动概要"
      },
      "style": {
        "variant": "primary",
        "padding": "md"
      },
      "children": [
        {
          "componentName": "EventSummary",
          "id": "event-summary-main",
          "props": {
            "eventId": 123
          }
        }
      ]
    }
  ]
}
```

---

### 3. 节点通用字段定义

每个 Schema 节点（组件实例）是一个对象，推荐字段如下：

- **`schemaVersion`**（可选，一般只在根节点出现）
  - 字符串版本号，如 `"1.0"`，用于控制 Schema 的版本与向后兼容。

- **`componentName`**（必选）
  - 字符串，对应实际渲染端要使用的组件名，例如：
    - `Page`, `Card`, `EventSummary`, `Canvas` 等。

- **`id`**（推荐）
  - 字符串，用于唯一标识该节点，方便调试、日志记录和局部更新。

- **`props`**（必选，可为空对象）
  - 组件的业务参数与配置，完全由具体组件定义和解释。
  - 示例：
    - 业务相关：`eventId`, `tier`, `server`, `playerId` 等。
    - 组件配置：`compact`, `showServer`, `showAvatar` 等。
  - 设计原则：
    - **每个组件的 `props` 都可以自定义任何参数**；
    - 渲染端根据 `componentName` 决定如何解释这些字段。

- **`style`**（推荐，与 `props` 并列）
  - 用来描述视觉和布局相关的属性，与业务配置分开。
  - 推荐使用抽象的样式 token，而不是直接写 CSS：
    - 例如：`padding: "sm" | "md" | "lg"`，`bg: "surface" | "primary" | "neutral"`。
  - 示例：

    ```json
    "style": {
      "variant": "primary",
      "padding": "md",
      "bg": "surface",
      "borderRadius": "lg"
    }
    ```

- **`children`**（可选）
  - 数组，子节点列表，形成组件树结构。
  - 是否可以拥有 `children` 由组件自身决定（例如：`Page`, `Card`, `Row`, `Column`, `Grid` 等一般是容器组件）。

- **`slot`**（可选）
  - 字符串，表示该子节点要挂载到父组件的哪个插槽上：
    - 如 `"header"`, `"footer"`, `"extra"` 等。

- **`layout`**（可选，主要给容器组件用）
  - 描述当前组件内部子元素的布局方式，例如：

    ```json
    "layout": {
      "type": "grid",
      "cols": 2,
      "gap": "md"
    }
    ```

- **`renderHints`**（可选）
  - 给不同渲染端的“渲染建议”，不改变语义，只做表现优化：

    ```json
    "renderHints": {
      "preferredOutput": "image",
      "maxWidth": 800
    }
    ```

- **可选扩展字段**
  - `visible`：简单的显隐控制，布尔值。
  - `condition`：更复杂的条件渲染，可选在后端或渲染端解释。

> 关于 `style` 的位置：  
> 本设计选择 **`style` 与 `props` 并列**，而不是放入 `props` 内部。  
> 这样可以清晰区分「业务参数」与「视觉/布局参数」，便于：
> - 渲染端单独处理主题与样式；
> - 未来为 LLM 提供更易控制的样式子集；
> - Bot / Web 前端在不同终端上各自映射样式而不影响业务逻辑。

---

### 4. Canvas / 画布类组件设计

对于需要“画图”的场景（例如活动报告、复杂图表等），Tsugu v5 不直接暴露底层画图 API，而是通过一个专用组件 + 命令列表来描述。

示例组件：`componentName = "Canvas"`

#### 4.1 基本结构

```json
{
  "componentName": "Canvas",
  "id": "event-cutoff-canvas",
  "props": {
    "width": 800,
    "height": 400,
    "background": "#101010",
    "commands": [
      {
        "op": "drawBackground",
        "params": {
          "variant": "event"
        }
      },
      {
        "op": "drawTitle",
        "params": {
          "text": "活动 123 档线",
          "accentColor": "primary"
        }
      },
      {
        "op": "drawCutoffChart",
        "params": {
          "eventId": 123,
          "tier": 1000
        }
      }
    ]
  },
  "style": {
    "marginTop": "lg"
  }
}
```

#### 4.2 设计原则

- `width`, `height`, `background` 等描述画布基础参数。
- `commands` 为画布的绘制命令列表：
  - `op`：操作名，如 `drawBackground`, `drawTitle`, `drawCutoffChart` 等。
  - `params`：每个操作需要的参数，由实现约定。

通过这种设计：

- **Web 前端** 可以用 Canvas / SVG / DOM 等方式实现这些 `op`；
- **Bot 端** 可以选择：
  - 直接复用 Web 前端（通过无头浏览器截图）；
  - 或在 Node 环境实现一套相同的 `commands` 执行逻辑（例如基于 Skia 或 node-canvas）。
- **LLM** 只需要组合已有的 `op` 与参数，而不需要生成底层坐标级别的绘图代码，安全性和稳定性都更好。

---

### 5. 渲染流程与多端适配

#### 5.1 Web 前端渲染流程

1. 路由解析：根据当前访问路径决定要请求的内容（例如 `/event/123/preview`）。
2. 向后端请求对应的 Tsugu Schema。
3. 使用 Vue 组件注册表，根据 `componentName` 实例化组件：
   - 递归渲染 `children`；
   - 应用 `props` 作为组件参数；
   - 将 `style` 映射到主题系统 / CSS 类。
4. 对 `Canvas` 等特殊组件，根据 `props.commands` 执行绘制逻辑。

#### 5.2 Bot 端渲染流程（推荐方案）

1. Bot 接收到用户指令（如 `查活动 123`）。
2. Bot 将结构化请求发送给后端，获取对应 Tsugu Schema。
3. Bot 内部通过 **无头浏览器** 加载 Web 前端（可为本地打包版本，也可以是远程站点）：
   - 将 Schema 通过 URL / POST / `window` 注入方式传入前端；
   - 等待前端渲染完成。
4. 使用无头浏览器对渲染结果截图，得到图片。
5. Bot 将图片发送回用户。

为兼顾部署成本和通用性，Bot 端可以提供两种模式：

- **simple 模式**：不依赖浏览器，简单将部分 Schema 渲染为纯文本 / 基础图片；
- **browser 模式**：启用无头浏览器，完整复用 Web 前端的 Vue 渲染逻辑。

---

### 6. 与 LLM 的集成展望

Tsugu v5 的 Schema 设计从一开始就为 LLM 预留空间：

- 后端可以提供「组件清单 + Schema 规范」给 LLM；
- 用户在 Web 或 Bot 端通过自然语言描述需求；
- 系统将用户输入 + 组件/Schema 说明一起发给 LLM，请其生成合法的 Tsugu Schema：
  - 指定 `componentName`；
  - 为每个组件填充合理的 `props`；
  - 按需求组合 `children` 与布局；
  - 可选地为重要组件设定简洁的 `style`。

之后，生成的 Schema 可以直接交给现有渲染管线（前端 / Bot）使用，实现：

- 自然语言 → Schema → Vue 组件调用 → 图片 / 页面展示。

---

### 7. 后续工作规划（简要）

1. **Schema 规范定稿**
   - 确定字段名与最小必需字段；
   - 梳理常用组件列表（例如：`EventSummary`, `EventCutoffList`, `SongList`, `PlayerStatus` 等）。

2. **后端改造**
   - 从“直接画图”迁移到“产出 Tsugu Schema”；
   - 逐个接口切换为返回 Schema，而不是图片/二进制。

3. **Web 前端实现**
   - 搭建 Vue 应用；
   - 编写基础布局组件（`Page`, `Card`, `Row`, `Column`, `Grid` 等）；
   - 实现 Tsugu 业务组件（`EventSummary`, `CutoffChart` 等）。

4. **Bot 端对接**
   - 请求后端获取 Schema；
   - 接入无头浏览器，调用前端渲染并截图。

5. **LLM 集成（后期）**
   - 编写 Schema JSON Schema & 组件文档；
   - 封装“自然语言 → Tsugu Schema”的接口；
   - 试验自然语言任意排版查询的体验。

---

本文件为 Tsugu v5 设计文档的初稿，后续可以根据实际实现情况补充：

- 组件清单与每个组件的 `props` 建议；
- 完整的 JSON Schema 定义；
- 示例请求/响应与调试脚本说明等。

