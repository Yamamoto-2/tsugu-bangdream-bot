import { Context, Schema, h, Session, Command, User } from 'koishi'
import { commandCard } from './commands/searchCard'
import { commandEvent } from './commands/searchEvent'
import { commandSong } from './commands/searchSong'
import { commandGacha } from './commands/searchGacha'
import { commandYcx } from './commands/ycx'
import { commandSearchPlayer } from './commands/searchPlayer'
import { commandYcxAll } from './commands/ycxAll'
import { commandGroupSetting } from './commands/groupSetting'
import { commandGachaSimulate } from './commands/gachaSimulate'
import { commandGetCardIllustration } from './commands/getCardIllustration'
import { commandCharacter } from './commands/searchCharacter'
import { commandSongMeta } from './commands/songMeta'
import { queryRoomNumber } from './commands/roomNumber'
import { drawRoomList } from './view/roomList'
import { BindingStatus, commandBindPlayer, commandPlayerInfo, commandSwitchDefaultServer, commandSwitchServerMode, commandUnbindPlayer, commandSwitchCarMode } from './commands/bindPlayer'
import { Server } from './types/Server'
import { globalDefaultServer } from './config'

export const name = 'tsugu-bangdream-bot'


declare module 'koishi' {
  interface User {
    tsugu: {
      user_id: string,
      platform: string,
      server_mode: Server,
      default_server: Server[],
      car: boolean,
      server_list: {
        gameID: number,
        verifyCode?: number,
        bindingStatus: BindingStatus
      }[]
    }
  }
  interface Channel {
    tsugu_gacha: boolean
  }
}

export interface Config {
  useEasyBG: boolean,
  bandoriStationToken: string,
}


export const Config = Schema.object({
  useEasyBG: Schema.boolean().default(false).description('是否使用简易背景，启用这将大幅提高速度'),
  bandoriStationToken: Schema.string().description('BandoriStationToken, 用于发送车牌，可以去 bandoristation.com 申请。缺失的情况下，车牌将无法被同步到服务器').required(false)
})


//判断左侧5个或者6个是否为数字
function checkLeftDigits(str: string): number {
  const regexSixDigits = /^(\d{6})/;
  const regexFiveDigits = /^(\d{5})/;

  const sixDigitsMatch = str.match(regexSixDigits);
  if (sixDigitsMatch) {
    return parseInt(sixDigitsMatch[1]);
  }

  const fiveDigitsMatch = str.match(regexFiveDigits);
  if (fiveDigitsMatch) {
    return parseInt(fiveDigitsMatch[1]);
  }

  return 0;
}




export function apply(ctx: Context, config: Config) {
  // 扩展 user 表存储玩家绑定数据
  ctx.model.extend('user',
    {
      'tsugu.user_id': 'string',
      'tsugu.platform': 'string',
      'tsugu.server_mode': { type: 'unsigned', initial: globalDefaultServer[0] },
      'tsugu.default_server': { type: 'list', initial: globalDefaultServer },
      'tsugu.car': { type: 'boolean', initial: true },
      'tsugu.server_list': {
        type: 'json', initial:
          [
            { gameID: 0, bindingStatus: BindingStatus.None },
            { gameID: 0, bindingStatus: BindingStatus.None },
            { gameID: 0, bindingStatus: BindingStatus.None },
            { gameID: 0, bindingStatus: BindingStatus.None },
            { gameID: 0, bindingStatus: BindingStatus.None }
          ]
      }
    })


  // 扩展 channel 表存储群聊中的查卡开关
  ctx.model.extend("channel",
    {
      tsugu_gacha: { type: 'boolean', initial: true }
    })

  //判断是否为车牌
  ctx.middleware(async (session, next) => {
    const number = checkLeftDigits(session.content)
    if (number != 0) {
      await session.observeUser(['tsugu'])
      await queryRoomNumber(<Session<'tsugu', never>>session, number, session.content, config.bandoriStationToken)
    }
  })
  ctx.command('ycm [keyword:text]', '获取车牌')
    .alias('有车吗', '车来')
    .usage(`获取所有车牌车牌，可以通过关键词过滤`)
    .example('ycm : 获取所有车牌')
    .example('ycm 大分: 获取所有车牌，其中包含"大分"关键词的车牌')
    .action(async ({ session }, keyword) => {
      return await drawRoomList(session, keyword)
    })
  ctx.command('开启车牌转发', '开启车牌转发')
    .userFields(['tsugu'])
    .action(async ({ session }) => {
      return await commandSwitchCarMode(session, true)
    })
  ctx.command('关闭车牌转发', '关闭车牌转发')
    .userFields(['tsugu'])
    .action(async ({ session }) => {
      return await commandSwitchCarMode(session, false)
    })

  ctx.command('查玩家 <playerId:number> [serverName:text]', '查询玩家信息')
    .alias('查询玩家')
    .usage('查询指定ID玩家的信息。省略服务器名时，默认从你当前的主服务器查询')
    .example('查玩家 10000000 : 查询你当前默认服务器中，玩家ID为10000000的玩家信息')
    .example('查玩家 40474621 jp : 查询日服玩家ID为40474621的玩家信息')
    .userFields(['tsugu'])
    .action(async ({ session }, playerId, serverName) => {
      return await commandSearchPlayer(session, playerId, serverName, config.useEasyBG)
    })
  ctx.command('绑定玩家 [serverName:text]', '绑定玩家信息')
    .usage('开始玩家数据绑定流程，请不要在"绑定玩家"指令后添加玩家ID。省略服务器名时，默认为绑定到你当前的主服务器。请在获得临时验证数字后，将玩家签名改为该数字，并回复你的玩家ID')
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandBindPlayer(session, serverName, config.useEasyBG)
    })
  ctx.command('解除绑定 [serverName:text]', '解除当前服务器的玩家绑定')
    .alias('解绑玩家')
    .usage('解除指定服务器的玩家数据绑定。省略服务器名时，默认为当前的主服务器')
    .usage('绑定流程出现问题时，可使用\"强制解绑玩家\"指令重置绑定状态')
    .option('force', '-f', { fallback: false })
    .shortcut('强制解绑玩家', { options: { force: true } })
    .shortcut('强制解除绑定', { options: { force: true } })
    .userFields(['tsugu'])
    .action(async ({ session, options }, serverName) => {
      return await commandUnbindPlayer(session, serverName, options.force)
    })
  ctx.command('主服务器 <serverName:text>', '设置主服务器')
    .alias('服务器模式', '切换服务器')
    .usage('将指定的服务器设置为你的主服务器')
    .example('主服务器 cn : 将国服设置为主服务器')
    .example('日服模式 : 将日服设置为主服务器')
    .shortcut(/^(.+服)模式$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandSwitchServerMode(session, serverName)
    })
  ctx.command('设置默认服务器 <...serverList>', '设定信息显示中的默认服务器排序')
    .alias('默认服务器')
    .usage('使用空格分隔服务器列表')
    .example('设置默认服务器 国服 日服 : 将国服设置为第一服务器，日服设置为第二服务器')
    .userFields(['tsugu'])
    .action(async ({ session }, ...serverList) => {
      return await commandSwitchDefaultServer(session, serverList)
    })
  ctx.command('玩家状态 [serverName:text]', '查询自己的玩家状态')
    .shortcut(/^(.+服)玩家状态$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandPlayerInfo(session, serverName, config.useEasyBG)
    })

  ctx.command("查卡 <word:text>", "查卡").alias('查卡牌')
    .usage('根据关键词或卡牌ID查询卡片信息，请使用空格隔开所有参数')
    .example('查卡 1399 :返回1399号卡牌的信息').example('查卡 绿 tsugu :返回所有属性为pure的羽泽鸫的卡牌列表')
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandCard(session, text, config.useEasyBG)
    })
  ctx.command('查卡面 <cardId:number>', '查卡面').alias('查卡插画', '查插画')
    .usage('根据卡片ID查询卡片插画').example('查卡面 1399 :返回1399号卡牌的插画')
    .userFields(['tsugu'])
    .action(async ({ session }, cardId) => {
      return await commandGetCardIllustration(session, cardId)
    })
  ctx.command('查角色 <word:text>', '查角色').usage('根据关键词或角色ID查询角色信息')
    .example('查角色 10 :返回10号角色的信息').example('查角色 吉他 :返回所有角色模糊搜索标签中包含吉他的角色列表')
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandCharacter(session, text)
    })

  ctx.command("查活动 <word:text>", "查活动").usage('根据关键词或活动ID查询活动信息')
    .example('查活动 177 :返回177号活动的信息').example('查活动 绿 tsugu :返回所有属性加成为pure，且活动加成角色中包括羽泽鸫的活动列表')
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandEvent(session, text, config.useEasyBG)
    })
  ctx.command("查曲 <word:text>", "查曲").usage('根据关键词或曲目ID查询曲目信息')
    .example('查曲 1 :返回1号曲的信息').example('查曲 ag lv27 :返回所有难度为27的ag曲列表')
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandSong(session, text)
    })
  ctx.command('查询效率表 <word:text>', '查询效率表').usage('查询指定服务器的歌曲效率表，如果没有服务器名的话，服务器为用户的默认服务器')
    .alias('查效率表', '查询效率榜', '查效率榜')
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandSongMeta(session, text)
    })
  ctx.command("查卡池 <gachaId:number>", "查卡池").usage('根据卡池ID查询卡池信息')
    .userFields(['tsugu'])
    .action(async ({ session }, gachaId) => {
      return await commandGacha(session, gachaId, config.useEasyBG)
    })

  ctx.command("ycx <tier:number> [eventId:number] [serverName]", "查询指定档位的预测线").usage('查询指定档位的预测线，如果没有服务器名的话，服务器为用户的默认服务器。如果没有活动ID的话，活动为当前活动')
    .example('ycx 1000 :返回默认服务器当前活动1000档位的档线与预测线').example('ycx 1000 177 jp:返回日服177号活动1000档位的档线与预测线')
    .userFields(['tsugu'])
    .action(async ({ session }, tier, eventId, serverName) => {
      return await commandYcx(session, tier, serverName, eventId)
    })
  ctx.command("ycxall [eventId:number] [serverName]", "查询所有档位的预测线").usage('查询所有档位的预测线，如果没有服务器名的话，服务器为用户的默认服务器。如果没有活动ID的话，活动为当前活动')
    .example('ycxall :返回默认服务器当前活动所有档位的档线与预测线').example('ycxall 177 jp:返回日服177号活动所有档位的档线与预测线')
    .alias('myycx')
    .userFields(['tsugu'])
    .action(async ({ session }, eventId, serverName) => {
      return await commandYcxAll(session, serverName, eventId)
    })

  ctx.command("抽卡 <word:text>", '开关群聊抽卡功能').usage('开关群聊抽卡功能，需要管理员权限')
    .example('开启抽卡 :开启群聊抽卡功能').example('关闭抽卡 :关闭群聊抽卡功能')
    .shortcut('开启抽卡', { args: ['on'] })
    .shortcut('关闭抽卡', { args: ['off'] })
    .channelFields(["tsugu_gacha"])
    .userFields(['authority'])
    .action(async ({ session }, text) => {
      const roles = session?.author.roles
      if (session.user.authority > 1 || roles?.includes('admin') || roles?.includes('owner')) {
        switch (text) {
          case "on":
          case "开启":
            session.channel.tsugu_gacha = true
            return "开启成功"
          case "off":
          case "关闭":
            session.channel.tsugu_gacha = false
            return "关闭成功"
        }
      }
    })
  ctx.command('抽卡模拟 [times:number] [gachaId:number]').usage('模拟抽卡，如果没有卡池ID的话，卡池为当前活动的卡池')
    .example('抽卡模拟:模拟抽卡10次').example('抽卡模拟 300 922 :模拟抽卡300次，卡池为922号卡池')
    .userFields(['tsugu'])
    .channelFields(['tsugu_gacha'])
    .action(async ({ session }, times, gachaId) => {
      return await commandGachaSimulate(session, times, gachaId)
    })

}




console.log("time:" + new Date().toLocaleString());