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
  content: {
    a: string,
    b: string
  }
}

export const Config: Schema<Config> = Schema.object({
  content: Schema.object({
    a: Schema.string(),
    b: Schema.string()
  })
})

//判断左侧是否为数字
function checkLeftDigits(input: string): number {
  const digits = input.substring(0, 6);
  if (/^\d{5}$|^\d{6}$/.test(digits)) {
    return parseInt(digits, 10);
  } else {
    return 0;
  }
}


export function apply(ctx: Context) {
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
      await queryRoomNumber(<Session<'tsugu', never>>session, number, session.content)
    }
  })
  ctx.command('ycm [keyword:text]', '获取车牌')
    .alias('有车吗', '车来')
    .usage(`根据关键词从车站获取车牌`)
    .example('ycm')
    .example('ycm 大分 长途')
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
    .example('查玩家 10000000')
    .example('查玩家 100001 jp')
    .userFields(['tsugu'])
    .action(async ({ session }, playerId, serverName) => {
      return await commandSearchPlayer(session, playerId, serverName)
    })
  ctx.command('绑定玩家 [serverName:text]', '绑定玩家信息')
    .usage('开始玩家数据绑定流程。省略服务器名时，默认为绑定到你当前的主服务器')
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandBindPlayer(session, serverName)
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
    .example('主服务器 cn')
    .example('日服模式')
    .shortcut(/^(.+服)模式$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandSwitchServerMode(session, serverName)
    })
  ctx.command('设置默认服务器 <...serverList>', '设定信息显示中的默认服务器排序')
    .alias('默认服务器')
    .usage('使用空格分隔服务器列表')
    .example('设置默认服务器 国服 日服')
    .userFields(['tsugu'])
    .action(async ({ session }, ...serverList) => {
      return await commandSwitchDefaultServer(session, serverList)
    })
  ctx.command('玩家状态 [serverName:text]', '查询自己的玩家状态')
    .shortcut(/^(.+服)玩家状态$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandPlayerInfo(session, serverName)
    })


  ctx.command("查卡 <word:text>", "查卡")
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandCard(session, text)
    })
  ctx.command('查卡面 <cardId:number>', '查卡面').alias('查卡插画', '查插画')
    .userFields(['tsugu'])
    .action(async ({ session }, cardId) => {
      return await commandGetCardIllustration(session, cardId)
    })
  ctx.command("查活动 <word:text>", "查活动")
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandEvent(session, text)
    })
  ctx.command("查曲 <word:text>", "查曲")
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandSong(session, text)
    })
  ctx.command("查卡池 <word:text>", "查卡池")
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandGacha(session, text)
    })

  ctx.command("ycx <tier:number> [eventId:number] [serverName]", "查询指定档位的预测线")
    .userFields(['tsugu'])
    .action(async ({ session }, tier, eventId, serverName) => {
      return await commandYcx(session, tier, serverName, eventId)
    })
  ctx.command("ycxall [eventId:number] [serverName]", "查询所有档位的预测线")
    .alias('myycx')
    .userFields(['tsugu'])
    .action(async ({ session }, eventId, serverName) => {
      return await commandYcxAll(session, serverName, eventId)
    })

  ctx.command("抽卡 <word:text>", '开关群聊抽卡功能')
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
  ctx.command('抽卡模拟 [times:number] [gachaId:number]')
    .userFields(['tsugu'])
    .channelFields(['tsugu_gacha'])
    .action(async ({ session }, times, gachaId) => {
      return await commandGachaSimulate(session, times, gachaId)
    })
}




console.log("time:" + new Date().toLocaleString());