# API

此 API 体系是由 Yamamoto-2 在将 Tsugu 搬迁至 Koishi 框架中时，为了进行前后端的分离而构建的一套 API 体系。整套 API 分为三个部分，分别为查询用 API 、用户数据 API 和车站 API 。

## 请求结构

对于请求中的 `Server` 型字段，在 **[查询 API](#查询-api)** 中，该字段为 [Server](#server-服务器) 列举中的值，而在 **[用户数据 API](#用户数据-api)** 中，该字段为 [ServerId](#serverid-服务器-id) 列举中的值。

### Server 服务器

| 名称 | 支持的值 | 说明 |
|:----:|:-------:|:-----|
| JP | `0`, `jp` | 日服 |
| EN | `1`, `en` | 国际服 |
| TW | `2`, `tw` | 台服 |
| CN | `3`, `cn` | 国服 |
| KR | `4`, `kr` | 韩服 (已停服) |

### ServerId 服务器 ID

| 名称 | 支持的值 | 说明 |
|:----:|:-------:|:-----|
| JP | `0` | 日服 |
| EN | `1` | 国际服 |
| TW | `2` | 台服 |
| CN | `3` | 国服 |
| KR | `4` | 韩服 (已停服) |

## 响应结构

除 **用户数据 API** 与 **车站 API** 以外的 API 都有一个统一的响应结构，为一个对象列表。对于用户数据 API 和车站 API ，其有单独的响应结构。

### 响应对象

此统一响应结构为一个列表，其中的元素为如下的对象。

| 字段名 | 数据类型 | 可能的值 | 说明 |
|:------:|:-------:|:-------:|:-----|
| `type` | string | `string` / `base64` | 表示 `string` 字段的值的内容类型。 |
| `string` | string | - | 当 `type` 值为 `string` 时，为 API 返回的响应文本；当 `type` 值为 `base64` 时，为 API 返回的图片的 Base64 字符串。 |

## 查询 API

进行信息和数据查询的 API ，当查询到具体信息后，后端将会返回多张图片；若查询出错，后端将会返回文本信息，表示后端出现的错误信息。

### 查询团队 festival 活动舞台数据

查询指定服务器的团队 festival 活动舞台数据，仅当指定活动为团队 festival 活动时可以获取到数据。

终结点: `POST /eventStage`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `server` | [Server](#server-服务器) | - | 用户所在的服务器。 |
| `eventId` | number? | `null` | 指定的活动 ID ，不指定则为当前活动。 |
| `meta` | boolean? | `false` | 是否携带歌曲分数信息。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。|

#### 响应结构

一个 [Response](#响应对象) 列表。

### 模拟抽卡

模拟指定卡池的抽卡结果。

终结点: `POST /gachaSimulate`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `server_mode` | [Server](#server-服务器) | - | 抽卡模拟使用的服务器，同一卡池在不同服务器的表现可能不同。 |
| `times` | number? | `10` | 模拟抽卡的次数。 |
|`compress`| boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |
| `gachaId` | number? | `null` | 若传入则模拟指定卡池的抽卡结果，不传入则默认为指定服务器的最新卡池。|

#### 响应结构

一个 [Response](#响应对象) 列表。

### 获取卡面图片

获取指定 ID 卡牌的卡面图片。

终结点: `POST /getCardIllustration`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `cardId` | number | - | 要获取卡面的卡牌 ID 。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询历史预测线

查询与指定活动相关的指定档位的历史预测线。

终结点: `POST /lsycx`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `server` | [Server](#server-服务器) | - | 要查询的指定服务器。 |
| `tier` | number | - | 要查询的档位排名。若传入不存在的档位会出现错误。 |
| `eventId` | number? | `null` | 若传入则查询指定活动，不传入则默认为指定服务器的最新活动。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 绘制房间列表图片

传入获取到的房间列表信息，获取绘制后的图片，或当没有房间时返回的信息。

终结点: `POST /roomList`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `roomList` | [Room](#room-房间信息)[] | - | 获取到的房间信息列表。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询卡牌信息

查询指定卡牌的信息，或查询符合条件的卡牌列表。

终结点: `POST /searchCard`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `default_servers` | [Server](#server-服务器)[] | - | 默认服务器列表，将会按顺序查询第一个有效的服务器。 |
| `text` | string | - | 将要查询的查询参数。 |
| `useEasyBG` | boolean | - | 是否使用简易背景。 `false` 即为不使用简易背景，此时后端图片生成耗时可能会大幅增加。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询角色信息

查询符合条件的角色信息。

终结点: `POST /searchCharacter`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `default_servers` | [Server](#server-服务器)[] | - | 默认服务器列表，将会按顺序查询第一个有效的服务器。 |
| `text` | string | - | 将要查询的查询参数。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询活动信息

查询指定活动的信息，或查询符合条件的活动列表。

终结点: `POST /searchEvent`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `default_servers` | [Server](#server-服务器)[] | - | 默认服务器列表，将会按顺序查询第一个有效的服务器。 |
| `text` | string | - | 将要查询的查询参数。 |
| `useEasyBG` | boolean | - | 是否使用简易背景。 `false` 即为不使用简易背景，此时后端图片生成耗时可能会大幅增加。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询卡池信息

查询指定卡池的信息。

终结点: `POST /searchGacha`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `default_servers` | [Server](#server-服务器)[] | - | 默认服务器列表，将会按顺序查询第一个有效的服务器。 |
| `gachaId` | number | - | 查询的卡池 ID 。 |
| `useEasyBG` | boolean | - | 是否使用简易背景。 `false` 即为不使用简易背景，此时后端图片生成耗时可能会大幅增加。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询玩家状态

查询指定服务器的指定玩家的状态图片。仅能查询到已公开的信息。

终结点: `POST /searchPlayer`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `playerId` | number | - | 查询的用户 ID 。 |
| `server` | [Server](#server-服务器) | - | 用户所在的服务器。 |
| `useEasyBG` | boolean | - | 是否使用简易背景。 `false` 即为不使用简易背景，此时后端图片生成耗时可能会大幅增加。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询歌曲信息

查询指定歌曲的信息，或查询符合条件的歌曲列表。

终结点: `POST /searchSong`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `default_servers` | [Server](#server-服务器)[] | - | 默认服务器列表，将会按顺序查询第一个有效的服务器。 |
| `text` | string | - | 将要查询的查询参数。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 获取歌曲谱面

获取指定歌曲的谱面图片。

终结点: `POST /songChart`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `default_servers` | [Server](#server-服务器)[] | - | 默认服务器列表，将会按顺序查询第一个有效的服务器。 |
| `songId` | number | - | 指定的歌曲 ID 。 |
| `difficultyText` | string | - | 指定谱面难度文本。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询歌曲分数表

查询歌曲分数排行表。

终结点: `POST /songMeta`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `default_servers` | [Server](#server-服务器)[] | - | 默认服务器列表，将会按顺序查询第一个有效的服务器。 |
| `server` | [Server](#server-服务器) | - | 要查询的主服务器。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询指定档位预测线

查询指定活动的指定档位的预测线。

终结点: `POST /ycx`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `server` | [Server](#server-服务器) | - | 要查询的指定服务器。 |
| `tier` | number | - | 要查询的档位排名。若传入不存在的档位会出现错误。 |
| `eventId` | number? | `null` | 若传入则查询指定活动，不传入则默认为指定服务器的最新活动。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

### 查询全档位预测线

查询指定活动的全档位预测线。

终结点: `POST /ycxAll`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `server` | [Server](#server-服务器) | - | 要查询的指定服务器。 |
| `eventId` | number? | `null` | 若传入则查询指定活动，不传入则默认为指定服务器的最新活动。 |
| `compress` | boolean? | `false` | 是否在后端压缩图像，压缩图像可以加快传输速度，但是会降低图片清晰度。 |

#### 响应结构

一个 [Response](#响应对象) 列表。

## 用户数据 API

进行用户数据获取和用户绑定的 API 。所有的 API 都有一个统一的 `/user` 终结点前缀。

单个用户通过 `platform` 和 `user_id` 字段进行联合指定。其中由于历史原因，QQ 平台的 `platform` 最好指定为 `red` ，否则对于之前绑定过的用户可能无法被指定到。**`onebot` 以及 `chronocat` 平台都将被后端处理为 `red` 。**

### 获取用户数据

获取指定用户的数据。

终结点: `POST /user/getUserData`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `platform` | string | - | 用户的平台名称。 |
| `user_id` | string | - | 用户的 ID 。 |

#### 响应结构

| 字段名 | 数据类型 | 可能的值 | 说明 |
|:------:|:-------:|:-------:|:-----|
| `status` | string | `success` / `failed` | 后端是否成功处理请求。 |
| `data` | string / [tsuguUser](#tsuguuser-用户数据) | - | 后端响应结果。若 `status` 为 `success` 则该字段为相应的数据对象，为 `failed` 则为错误原因。 |

##### tsuguUser 用户数据

| 字段名 | 数据类型 | 说明 |
|:------:|:-------:|:-----|
| `_id` | string? | 可能存在。若用户已存在，此字段为用户的唯一标识符。 |
| `user_id` | string | 用户 ID 。 |
| `platform` | string | 用户所在平台。 |
| `server_mode` | [Server](#serverid-服务器-id) | 用户的主服务器模式。 |
| `default_server` | [Server](#serverid-服务器-id)[] | 用户的默认服务器列表。 |
| `car` | boolean | 是否转发该用户的房间号。 `false` 则会忽视来自该用户的房间号。 |
| `server_list` | [tsuguUserServerInList](#tsuguuserserverinlist-服务器绑定数据)[] | 该用户绑定的服务器数据列表。长度必定等于全部服务器数，列表中每一项代表着对应服务器上的绑定数据，下标与 [Server](#serverid-服务器-id) 对应。 |

##### tsuguUserServerInList 服务器绑定数据

| 字段名 | 数据类型 | 说明 |
|:------:|:-------:|:-----|
| `playerId` | number | 用户在该服务器绑定的玩家 ID 。 |
| `bindingStatus` | [BindingStatus](#bindingstatus-绑定状态) | 用户在该服务器上的绑定状态。 |

##### BindingStatus 绑定状态

| 名称 | 值 | 说明 |
|:----:|:--:|:-----|
| None | `0` | 未绑定 |
| Verifying | `1` | 正在验证 |
| Success | `2` | 绑定成功 |

### 修改用户数据

修改指定用户的数据。

尽管接收一个 [PartialTsuguUser](#partialtsuguuser-修改用户数据) 作为参数，实际上只能够通过该 API 修改 `server_mode` , `default_server` 和 `car` 字段数据。

终结点: `POST /user/changeUserData`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `platform` | string | - | 用户的平台名称。 |
| `user_id` | string | - | 用户的 ID 。 |
| `update` | [PartialTsuguUser](#partialtsuguuser-修改用户数据) | - | 用户的 ID 。 |

##### PartialTsuguUser 修改用户数据

| 字段名 | 数据类型 | 说明 |
|:------:|:-------:|:-----|
| `user_id` | string? | 用户 ID 。 |
| `platform` | string? | 用户所在平台。 |
| `server_mode` | [Server](#serverid-服务器-id)? | 用户的主服务器模式。 |
| `default_server` | [Server](#serverid-服务器-id)[]? | 用户的默认服务器列表。 |
| `car` | boolean? | 是否转发该用户的房间号。 `false` 则会忽视来自该用户的房间号。 |
| `server_list` | [tsuguUserServerInList](#tsuguuserserverinlist-服务器绑定数据)[]? | 该用户绑定的服务器数据列表。长度必定等于全部服务器数，列表中每一项代表着对应服务器上的绑定数据，下标与 [Server](#serverid-服务器-id) 对应。 |

#### 响应结构

| 字段名 | 数据类型 | 可能的值 | 说明 |
|:------:|:-------:|:-------:|:-----|
| `status` | string | `success` / `failed` | 后端是否成功处理请求。 |
| `data` | string? | - | 后端响应结果。 |

### 请求绑定用户

向后端发送绑定用户的请求。

终结点: `POST /user/bindPlayerRequest`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `platform` | string | - | 用户的平台名称。 |
| `user_id` | string | - | 用户的 ID 。 |
| `server` | [Server](#serverid-服务器-id) | - | 要绑定的服务器。 |
| `bindType` | boolean | - | `true` 为绑定玩家， `false` 为进行解绑。 |

#### 响应结构

| 字段名 | 数据类型 | 可能的值 | 说明 |
|:------:|:-------:|:-------:|:-----|
| `status` | string | `success` / `failed` | 后端是否成功处理请求。 |
| `data` | string / [VerifyCode](#verifycode-验证码) | - | 后端响应结果。若 `status` 为 `success` 则该字段为相应的数据对象 [VerifyCode](#verifycode-验证码) ，为 `failed` 则为错误原因 `string` 。 |

##### VerifyCode 验证码

| 字段名 | 数据类型 | 说明 |
|:------:|:-------:|:----|
| `verifyCode` | number | 一个五位的数字，用于进行验证。 |

### 验证绑定用户

向后端发送验证绑定用户的请求。

终结点: `POST /user/bindPlayerVerification`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:-----:|:-----|
| `platform` | string | - | 用户的平台名称。 |
| `user_id` | string | - | 用户的 ID 。 |
| `server` | [Server](#serverid-服务器-id) | - | 要绑定的服务器。 |
| `playerId` | number | - | 要进行操作的玩家 ID 。 |
| `bindType` | boolean | - | `true` 为绑定玩家， `false` 为进行解绑。 |

#### 响应结构

| 字段名 | 数据类型 | 可能的值 | 说明 |
|:------:|:-------:|:-------:|:-----|
| `status` | string | `success` / `failed` | 后端是否成功处理请求。 |
| `data` | string | - | 后端响应结果。若 `status` 为 `success` 则该字段为成功信息，为 `failed` 则为错误原因。 |

## 车站 API

后端对车站进行转接的 API 。所有的 API 都有一个统一的 `/station` 终结点前缀。

### 上传房间

向车站上传房间信息。

终结点: `POST /station/submitRoomNumber`

#### 请求结构

| 字段名 | 数据类型 | 默认值 | 说明 |
|:------:|:-------:|:------:|:----|
| `number` | number | - | 上传的房间号。 |
| `rawMessage` | string | - | 房间号的备注信息，用于对房间进行说明。 |
| `platform` | string | - | 用户所在平台。 |
| `user_id` | string | - | 用户的 ID 。 |
| `userName` | string | - | 用户的名称。 |
| `time` | number | - | 房间上传的时间。 |
| `bandoriStationToken` | string? | - | 使用的车站令牌，不传入则使用 Tsugu 的令牌。 |

#### 响应结构

| 字段名 | 数据类型 | 可能的值 | 说明 |
|:------:|:-------:|:-------:|:-----|
| `status` | string | `success` / `failed` | 后端是否成功处理请求。 |
| `data` | string | - | 后端响应结果。若 `status` 为 `success` 则该字段为成功信息，为 `failed` 则为错误原因。 |

### 查询最近房间数据

查询车站里最近的房间数据列表。

终结点: `GET /station/queryAllRoom`

> 该 API 没有请求结构。

#### 响应结构

| 字段名 | 数据类型 | 可能的值 | 说明 |
|:------:|:-------:|:-------:|:-----|
| `status` | string | `success` / `failed` | 后端是否成功处理请求。 |
| `data` | string / [Room](#room-房间信息)[] | - | 后端响应结果。若 `status` 为 `success` 则该字段为相应的数据对象 [Room](#room-房间信息)[] ，为 `failed` 则为错误原因 `string` 。 |

##### Room 房间信息

对于 [`/roomList`](#绘制房间列表图片) API ，其需要一个专门的房间信息对象列表。

同时，该对象也是 [`/station/queryAllRoom`](#查询最近房间数据) API 响应成功时的响应数据对象。

| 字段名 | 数据类型 | 说明 |
|:------:|:-------:|:-----|
| `number` | number | 房间号。 |
| `rawMessage` | string | 上传房间时的附加注释信息。 |
| `source` | string | 上传房间号的来源。 |
| `userId` | number | 上传房间号的用户 ID 。 |
| `time` | number | 房间号上传时的时间戳。 |
| `player` | [Player](#player-玩家信息) | 上传用户的默认玩家信息。 |
| `avanter` | string? | 上传房间号的用户头像。 |
| `userName` | string? | 上传房间号的用户名称。 |

##### Player 玩家信息

| 字段名 | 数据类型 | 说明 |
|:------:|:-------:|:-----|
| `id` | number | 玩家 ID 。 |
| `server` | [Server](#serverid-服务器-id) | 服务器 ID 。 |
