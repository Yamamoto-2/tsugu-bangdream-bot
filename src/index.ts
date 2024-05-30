import { Context, Schema, h, Session, Element } from 'koishi'
import { commandCard } from './commands/searchCard'
import { commandEvent } from './commands/searchEvent'
import { commandSong } from './commands/searchSong'
import { commandGacha } from './commands/searchGacha'
import { commandCutoffDetail } from './commands/cutoffDetail'
import { commandSearchPlayer } from './commands/searchPlayer'
import { commandCutoffListOfRecentEvent } from './commands/cutoffListOfRecentEvent'
import { commandCutoffCompare } from './commands/cutoffCompare'
import { commandGachaSimulate } from './commands/gachaSimulate'
import { commandGetCardIllustration } from './commands/getCardIllustration'
import { commandCharacter } from './commands/searchCharacter'
import { commandSongMeta } from './commands/songMeta'
import { roomNumber } from './commands/roomNumber'
import { commandRoomList } from './commands/roomList'
import { commandBindPlayer, commandPlayerInfo, commandSwitchDisplayedServerList, commandSwitchServerMode, commandUnbindPlayer, commandSwitchCarMode } from './commands/user'
import { commandSongChart } from './commands/songChart'
import { commandEventStage } from './commands/eventStage'
import { Server } from './types/Server'
import { globalDefaultServer,  tsuguUser } from './config'
import { tierListOfServerToString, checkLeftDigits, paresMessageList, stringArrayToNumberArray } from './utils'
import { getRemoteDBUserData } from './api/remoteDB'
import { serverNameFuzzySearchResult } from './api/fuzzySearch'


export const name = 'tsugu-bangdream-bot'


declare module 'koishi' {
  interface User {
    tsugu: {
      userId: string,
      platform: string,
      mainServer: Server,
      displayedServerList: Server[],
      shareRoomNumber: boolean,
      userPlayerIndex: number,
      userPlayerList: {
        playerId: number,
        server: Server,
      }[]
    }
  }
  interface Channel {
    tsugu_gacha: boolean,
    tsugu_run: boolean,
  }
}

export interface Config {
  useEasyBG: boolean,
  compress: boolean,
  bandoriStationToken: string,
  backendUrl: string,
  RemoteDBSwitch: boolean,
  RemoteDBUrl: string,

  noSpace: boolean,
  reply: boolean,
  at: boolean,
}


export const Config = Schema.intersect([
  Schema.object({
    useEasyBG: Schema.boolean().default(false).description('是否使用简易背景, 启用这将大幅提高速度, 关闭将使部分界面效果更美观'),
    compress: Schema.boolean().default(true).description('是否压缩图片, 启用会使图片质量下降, 大幅提高速度, 体积减小从而减少图片传输时所需的时间, 关闭会提高画面清晰度'),
    bandoriStationToken: Schema.string().description('BandoriStationToken, 用于发送车牌, 可以去 https://github.com/maborosh/BandoriStation/wiki/API%E6%8E%A5%E5%8F%A3 申请。缺失情况下, 视为Tsugu车牌'),

    reply: Schema.boolean().default(false).description('消息是否回复用户'),
    at: Schema.boolean().default(false).description('消息是否@用户'),
    noSpace: Schema.boolean().default(false).description('是否启用无需空格触发大部分指令, 启用这将方便一些用户使用习惯, 但会增加bot误判概率, 仍然建议使用空格'),

    backendUrl: Schema.string().required(false).default('http://tsugubot.com:8080').description('后端服务器地址, 用于处理指令。如果有自建服务器, 可以改成自建服务器地址。默认为Tsugu公共后端服务器。如果你在本机部署后端, 请写 "http://127.0.0.1:3000"'),
    RemoteDBSwitch: Schema.boolean().default(false).description('是否使用独立后端的数据库。启用后, 所有用户数据与车牌数据将使用远程数据库而不是koishi数据库'),
  }).description('Tsugu BangDream Bot 配置'),
  Schema.union([
    Schema.object({
      RemoteDBSwitch: Schema.const(true).required(),
      RemoteDBUrl: Schema.string().default('http://tsugubot.com:8080').description('后端服务器地址, 用于处理用户数据库。如果有自建服务器, 可以改成自建服务器地址。默认为Tsugu公共后端服务器。如果你在本机部署后端, 请写 "http://127.0.0.1:3000"')
    }),
    Schema.object({}),
  ]),
])



export function apply(ctx: Context, config: Config) {
  // 扩展 user 表存储玩家绑定数据
  ctx.model.extend('user',
    {
      'tsugu.userId': 'string',
      'tsugu.platform': 'string',
      'tsugu.mainServer': { type: 'unsigned', initial: globalDefaultServer[0] },
      'tsugu.displayedServerList': { type: 'list', initial: globalDefaultServer },
      'tsugu.shareRoomNumber': { type: 'boolean', initial: true },
      'tsugu.userPlayerIndex': { type: 'unsigned', initial: 0 },
      'tsugu.userPlayerList': {
        type: 'json', initial: []
      }
    }
  )

  // 扩展 channel 表存储群聊中的查卡开关
  ctx.model.extend("channel",
    {
      tsugu_gacha: { type: 'boolean', initial: true },
      tsugu_run: { type: 'boolean', initial: true },
    })

  //获取用户数据函数
  async function observeUserTsugu(session: Session): Promise<tsuguUser> {
    async function getLocalUserData(session: Session): Promise<tsuguUser> {
      const localResult = await session.observeUser(['tsugu'])
      //修复数据库中的displayedServerList为string数组的问题
      localResult.tsugu.displayedServerList = stringArrayToNumberArray(localResult.tsugu.displayedServerList)
      return localResult.tsugu
    }
    if (config.RemoteDBSwitch) {
      const platform = session.platform
      const userId = session.userId
      const remoteResult = await getRemoteDBUserData(config.RemoteDBUrl, platform, userId)
      if (remoteResult.status == 'success') {
        return remoteResult.data as tsuguUser
      }
      else {
        session.send(remoteResult.data as string)
        return (await getLocalUserData(session))
      }
    }
    else {
      return (await getLocalUserData(session))
    }
  }

  //判断是否为车牌
  ctx.middleware(async (session, next) => {
    const number = checkLeftDigits(session.content)
    if (number != 0) {
      await session.observeUser(['tsugu'])
      const tsuguUserData = await observeUserTsugu(session)
      await roomNumber(config, session as Session<'tsugu', never>, tsuguUserData, number, session.content)
      return next();
    } else {
      return next();
    }
  })

  // 使得打指令不需要加空格
  ctx.middleware((session, next) => {
    if (config.noSpace) {
      // 查卡面 一定要放在 查卡 前面
      const keywords = ['查询玩家', '查卡面', '查玩家', '查卡', '查角色', '查活动', '查分数表', '查询分数榜', '查分数榜', '查曲', '查谱面', , '查卡池', '查询分数表', 'ycx', 'ycxall', 'lsycx', '抽卡模拟', '绑定玩家', '解除绑定', '主服务器', '设置默认服务器', '玩家状态', '开启车牌转发', '关闭车牌转发'];
      // 检查会话内容是否以列表中的任何一个词语开头
      const keyword = keywords.find(keyword => session.content.startsWith(keyword));

      if (keyword) {
        if (session.content[keyword.length] === ' ') {
          return next();
        } else {
          const content_cut = session.content.slice(keyword.length);
          return session.execute(`${keyword} ${content_cut}`, next);
        }
      }
      else {
        return next();
      }
    }
    else {
      return next();
    }
  });
  //群相关
  /*
  ctx.command("抽卡 <word:text>", '开关群聊抽卡功能').usage('开关群聊抽卡功能, 需要管理员权限')
    .example('开启抽卡 :开启群聊抽卡功能').example('关闭抽卡 :关闭群聊抽卡功能')
    .shortcut('开启抽卡', { args: ['on'] })
    .shortcut('关闭抽卡', { args: ['off'] })
    .channelFields(["tsugu_gacha"])
    .userFields(['authority'])
    .action(async ({ session }, text) => {
      // 获取 session.event.member.roles 和 session.author.roles
      const eventMemberRoles = session.event.member.roles || [];
      const authorRoles = session.author.roles || [];
      // 合并两个角色列表并去重
      const roles = Array.from(new Set([...eventMemberRoles, ...authorRoles]));
      // 检查是否有所需角色
      const hasRequiredRole = roles.includes('admin') || roles.includes('owner');
      // 检查用户是否有足够的权限：authority > 1 或者角色是 admin 或 owner
      if (session.user.authority > 1 || hasRequiredRole) {
        switch (text) {
          case "on":
          case "开启":
            session.channel.tsugu_gacha = true;
            return "开启成功";
          case "off":
          case "关闭":
            session.channel.tsugu_gacha = false;
            return "关闭成功";
          default:
            return "无效指令";
        }
      } else {
        return "您没有权限执行此操作";
      }
    })
  ctx.command("tsugu_swc <word:text>", '开关本频道tsugu')
    .usage('[试验性功能]\n发送tsugu_swc查看当前开关状态\n使用tsugu_swc on @tsugu 开启tsugu, 使用tsugu_swc off @tsugu 关闭tsugu, 试验性功能需要管理员权限')
    .channelFields(["tsugu_run"])
    .userFields(['authority'])
    .action(async ({ session }, text) => {
      if (session.event.message.content == 'tsugu_swc') {
        return `当前tsugu运行状态为 ${session.channel.tsugu_run}`
      }
      // 获取 session.event.member.roles 和 session.author.roles
      const eventMemberRoles = session?.event?.member?.roles || [];
      const authorRoles = session?.author?.roles || [];
      // 合并两个角色列表并去重
      const roles = Array.from(new Set([...eventMemberRoles, ...authorRoles]));

      // 检查是否有所需角色
      const hasRequiredRole = roles.includes('admin') || roles.includes('owner');

      // 检查用户是否有足够的权限：authority > 1 或者角色是 admin 或 owner
      if (session.user.authority > 1 || hasRequiredRole) {
        if (session.content.includes('on') && session.content.includes(session.selfId)) {
          session.channel.tsugu_run = true;
          return '开启成功';
        }
        else if (session.content.includes('off') && session.content.includes(session.selfId)) {
          session.channel.tsugu_run = false;
          return '关闭成功';
        } else {
          return '无效指令';
        }
      } else {
        return '您没有权限执行此操作';
      }
    })
    */
  //玩家相关
  ctx.command('开启车牌转发', '开启车牌转发')
    .userFields(['tsugu'])
    .action(async ({ session }) => {
      return await commandSwitchCarMode(config, session, true)
    })
  ctx.command('关闭车牌转发', '关闭车牌转发')
    .userFields(['tsugu'])
    .action(async ({ session }) => {
      return await commandSwitchCarMode(config, session, false)
    })

  ctx.command('绑定玩家 [serverName:text]', '绑定玩家信息')
    .usage('开始玩家数据绑定流程, 请不要在"绑定玩家"指令后添加玩家ID。省略服务器名时, 默认为绑定到你当前的主服务器。请在获得临时验证数字后, 将玩家签名改为该数字, 并回复你的玩家ID')
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      return await commandBindPlayer(config, session, mainServer)
    })
  ctx.command('解除绑定 [serverName:text]', '解除当前服务器的玩家绑定')
    .alias('解绑玩家')
    .usage('解除指定服务器的玩家数据绑定。省略服务器名时, 默认为当前的主服务器')
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      return await commandUnbindPlayer(config, session, mainServer)
    })
  ctx.command('主服务器 <serverName:text>', '设置主服务器')
    .alias('服务器模式', '切换服务器')
    .usage('将指定的服务器设置为你的主服务器')
    .example('主服务器 cn : 将国服设置为主服务器')
    .example('日服模式 : 将日服设置为主服务器')
    .shortcut(/^(.+服)模式$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      return await commandSwitchServerMode(config, session, mainServer)
    })
  ctx.command('设置默认服务器 <...serverList>', '设定信息显示中的默认服务器排序')
    .alias('默认服务器')
    .usage('使用空格分隔服务器列表')
    .example('设置默认服务器 国服 日服 : 将国服设置为第一服务器, 日服设置为第二服务器')
    .userFields(['tsugu'])
    .action(async ({ session }, ...serverList) => {
      return await commandSwitchDisplayedServerList(config, session, serverList)
    })
  ctx.command('玩家状态 [serverName:text]', '查询自己的玩家状态')
    .shortcut(/^(.+服)玩家状态$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      return await commandPlayerInfo(config, session, mainServer)
    })

  //其他
  ctx.command('ycm [keyword:text]', '获取车牌')
    .alias('有车吗', '车来')
    .usage(`获取所有车牌车牌, 可以通过关键词过滤`)
    .example('ycm : 获取所有车牌')
    .example('ycm 大分: 获取所有车牌, 其中包含"大分"关键词的车牌')
    .action(async ({ session }, keyword) => {
      const list = await commandRoomList(config, keyword)
      return (paresMessageList(list))
    })
  ctx.command('查玩家 <playerId:number> [serverName:text]', '查询玩家信息')
    .alias('查询玩家')
    .usage('查询指定ID玩家的信息。省略服务器名时, 默认从你当前的主服务器查询')
    .example('查玩家 10000000 : 查询你当前默认服务器中, 玩家ID为10000000的玩家信息')
    .example('查玩家 40474621 jp : 查询日服玩家ID为40474621的玩家信息')
    .action(async ({ session }, playerId, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      const list = await commandSearchPlayer(config, playerId, mainServer)
      return (paresMessageList(list))
    })
  ctx.command("查卡 <word:text>", "查卡").alias('查卡牌')
    .usage('根据关键词或卡牌ID查询卡片信息, 请使用空格隔开所有参数')
    .example('查卡 1399 :返回1399号卡牌的信息').example('查卡 绿 tsugu :返回所有属性为pure的羽泽鸫的卡牌列表')
    .action(async ({ session }, text) => {
      const tsuguUserData = await observeUserTsugu(session)
      const displayedServerList = tsuguUserData.displayedServerList
      const list = await commandCard(config, displayedServerList, text)
      return (paresMessageList(list))
    })
  ctx.command('查卡面 <cardId:number>', '查卡面').alias('查卡插画', '查插画')
    .usage('根据卡片ID查询卡片插画').example('查卡面 1399 :返回1399号卡牌的插画')
    .action(async ({ session }, cardId) => {
      const list = await commandGetCardIllustration(config, cardId)
      return paresMessageList(list)
    })
  ctx.command('查角色 <word:text>', '查角色').usage('根据关键词或角色ID查询角色信息')
    .example('查角色 10 :返回10号角色的信息').example('查角色 吉他 :返回所有角色模糊搜索标签中包含吉他的角色列表')
    .action(async ({ session }, text) => {
      const tsuguUserData = await observeUserTsugu(session)
      const displayedServerList = tsuguUserData.displayedServerList
      const list = await commandCharacter(config, displayedServerList, text)
      return paresMessageList(list)
    })

  ctx.command("查活动 <word:text>", "查活动").usage('根据关键词或活动ID查询活动信息')
    .example('查活动 177 :返回177号活动的信息').example('查活动 绿 tsugu :返回所有属性加成为pure, 且活动加成角色中包括羽泽鸫的活动列表')
    .action(async ({ session }, text) => {
      const tsuguUserData = await observeUserTsugu(session)
      const displayedServerList = tsuguUserData.displayedServerList
      const list = await commandEvent(config, displayedServerList, text)
      return paresMessageList(list)
    })
  ctx.command("查曲 <word:text>", "查曲").usage('根据关键词或曲目ID查询曲目信息')
    .example('查曲 1 :返回1号曲的信息').example('查曲 ag lv27 :返回所有难度为27的ag曲列表')
    .action(async ({ session }, text) => {
      const tsuguUserData = await observeUserTsugu(session)
      const displayedServerList = tsuguUserData.displayedServerList
      const list = await commandSong(config, displayedServerList, text)
      return paresMessageList(list)
    })
  ctx.command("查谱面 <songId:number> [difficultyText:text]", "查谱面").usage('根据曲目ID与难度查询铺面信息')
    .example('查谱面 1 :返回1号曲的所有铺面').example('查谱面 1 expert :返回1号曲的expert难度铺面')
    .action(async ({ session }, songId, difficultyText) => {
      const tsuguUserData = await observeUserTsugu(session)
      const displayedServerList = tsuguUserData.displayedServerList
      let difficultyId: number
      if (difficultyText) {
        const fuzzySearchResult = await serverNameFuzzySearchResult(config, difficultyText)
        if (!fuzzySearchResult['difficulty']) {
          return '错误: 难度名未能匹配任何难度'
        }
        difficultyId = fuzzySearchResult['difficulty'][0]
      }
      const list = await commandSongChart(config, displayedServerList, songId, difficultyId)
      return paresMessageList(list)
    })
  ctx.command('查询分数表 <serverName:string>', '查询分数表').usage('查询指定服务器的歌曲分数表, 如果没有服务器名的话, 服务器为用户的默认服务器')
    .alias('查分数表', '查询分数榜', '查分数榜').example('查询分数表 cn :返回国服的歌曲分数表')
    .action(async ({ session }, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      const displayedServerList = tsuguUserData.displayedServerList
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      const list = await commandSongMeta(config, displayedServerList, mainServer)
      return paresMessageList(list)

    })

  ctx.command("查试炼 <eventId:number>", "查试炼").usage('查询当前服务器当前活动试炼信息\n可以自定义活动ID\n参数:-m 显示歌曲meta(相对效率)')
    .alias('查stage', '查舞台', '查festival', '查5v5')
    .example('查试炼 157 -m :返回157号活动的试炼信息, 包含歌曲meta')
    .example('查试炼 -m :返回当前活动的试炼信息, 包含歌曲meta')
    .example('查试炼 :返回当前活动的试炼信息')
    .option('meta', '-m')
    .action(async ({ session, options }, eventId) => {
      const tsuguUserData = await observeUserTsugu(session)
      const mainServer = tsuguUserData.mainServer
      const list = await commandEventStage(config, mainServer, eventId, options.meta,)
      return paresMessageList(list)
    })

  ctx.command("查卡池 <gachaId:number>", "查卡池").usage('根据卡池ID查询卡池信息')
    .action(async ({ session }, gachaId) => {
      const tsuguUserData = await observeUserTsugu(session)
      const displayedServerList = tsuguUserData.displayedServerList
      const list = await commandGacha(config, displayedServerList, gachaId)
      return paresMessageList(list)
    })

  ctx.command("ycx <tier:number> [eventId:number] [serverName]", "查询指定档位的预测线").usage(`查询指定档位的预测线, 如果没有服务器名的话, 服务器为用户的默认服务器。如果没有活动ID的话, 活动为当前活动\n可用档线:\n:\n${tierListOfServerToString()}`)
    .example('ycx 1000 :返回默认服务器当前活动1000档位的档线与预测线').example('ycx 1000 177 jp:返回日服177号活动1000档位的档线与预测线')
    .action(async ({ session }, tier, eventId, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      const list = await commandCutoffDetail(config, mainServer, tier, eventId)
      return paresMessageList(list)
    })
  ctx.command("ycxall [eventId:number] [serverName]", "查询所有档位的预测线").usage(`查询所有档位的预测线, 如果没有服务器名的话, 服务器为用户的默认服务器。如果没有活动ID的话, 活动为当前活动\n可用档线:\n${tierListOfServerToString()}`)
    .example('ycxall :返回默认服务器当前活动所有档位的档线与预测线').example('ycxall 177 jp:返回日服177号活动所有档位的档线与预测线')
    .alias('myycx')
    .action(async ({ session }, eventId, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      const list = await commandCutoffCompare(config, mainServer, eventId)
      return paresMessageList(list)
    })
  ctx.command("lsycx <tier:number> [eventId:number] [serverName]", "查询指定档位的预测线").usage(`查询指定档位的预测线, 与最近的4期活动类型相同的活动的档线数据, 如果没有服务器名的话, 服务器为用户的默认服务器。如果没有活动ID的话, 活动为当前活动\n可用档线:\n${tierListOfServerToString()}`)
    .example('lsycx 1000 :返回默认服务器当前活动的档线与预测线, 与最近的4期活动类型相同的活动的档线数据').example('lsycx 1000 177 jp:返回日服177号活动1000档位档线与最近的4期活动类型相同的活动的档线数据')
    .action(async ({ session }, tier, eventId, serverName) => {
      const tsuguUserData = await observeUserTsugu(session)
      let mainServer: Server = tsuguUserData.mainServer
      if (serverName) {
        const serverFromServerNameFuzzySearch = await serverNameFuzzySearchResult(config, serverName)
        if (serverFromServerNameFuzzySearch == -1) {
          return '错误: 服务器名未能匹配任何服务器'
        }
        mainServer = serverFromServerNameFuzzySearch
      }
      const list = await commandCutoffListOfRecentEvent(config, mainServer, tier, eventId)
      return paresMessageList(list)
    })

  ctx.command('抽卡模拟 [times:number] [gachaId:number]').usage('模拟抽卡, 如果没有卡池ID的话, 卡池为当前活动的卡池')
    .example('抽卡模拟:模拟抽卡10次').example('抽卡模拟 300 922 :模拟抽卡300次, 卡池为922号卡池')
    .channelFields(['tsugu_gacha'])
    .action(async ({ session }, times, gachaId) => {
      const status = session.channel?.tsugu_gacha ?? true
      if (status) {
        const tsuguUserData = await observeUserTsugu(session)
        const mainServer = tsuguUserData.mainServer
        const list = await commandGachaSimulate(config, mainServer, times, gachaId)
        return (paresMessageList(list))
      }
      else {
        return '抽卡功能已关闭'
      }
    })
  ctx.on('command/before-execute', (argv) => {
    const { command, session } = argv;
    const now_channel = session.channelId;
    // 其他逻辑代码继续执行
    async function getChannelData() {
      const channel_get = await ctx.database.get('channel', { id: now_channel });
      if (channel_get[0]?.tsugu_run === false) {
        const keywords = ['查询玩家', '查卡面', '查玩家', '查卡', '查角色', '查活动', '查分数表', '查询分数榜', '查分数榜', '查曲', '查谱面', '查卡池', '查询分数表', 'ycx', 'ycxall', 'lsycx', '抽卡模拟', '绑定玩家', '解除绑定', '主服务器', '设置默认服务器', '玩家状态', '开启车牌转发', '关闭车牌转发'];
        const messageContent = session.event.message.content;
        // 检查消息是否以数组中的任意一个词开始
        const startsWithKeyword = keywords.some(keyword => messageContent.startsWith(keyword));
        if (startsWithKeyword) {
          console.log('尝试关闭');
          return '';
        }
      }
    }
    return getChannelData(); // 将结果返回给原始的命令执行过程
  });
  // 为bot添加回复/at功能
  ctx.before('send', (session, options) => { // options 包含来自 user 的上文 session
    if (config.at) {
      session.elements.unshift(h('at', { id: options.session.event.user.id }));
    }
    if (config.reply) {
      session.elements.unshift(h('quote', { id: options.session.event.message.id }));
    }
  })
}
