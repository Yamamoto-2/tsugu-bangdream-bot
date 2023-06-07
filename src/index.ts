import { Context, Schema, h, Session, Command, User } from 'koishi'
import { commandCard } from './commands/searchCard'
import { commandEvent } from './commands/searchEvent'
import { commandSong } from './commands/searchSong'
import { commandGacha } from './commands/searchGacha'
import { commandYcx } from './commands/ycx'
import { commandSearchPlayer } from './commands/searchPlayer'
import { commandYcxAll } from './commands/ycxAll'
import { commandGroupSetting } from './commands/groupSetting'
import { BindingStatus, commandBindPlayer, commandPlayerInfo, commandSwitchDefaultServer, commandSwitchServerMode, commandUnbindPlayer } from './commands/bindPlayer'
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


  ctx.command('查玩家 <playerId:number> [serverName:text]', '查询玩家')
    .userFields(['tsugu'])
    .action(async ({ session }, playerId, serverName) => {
      return await commandSearchPlayer(session, playerId, serverName)
    })
  ctx.command('绑定玩家 [serverName:text]')
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandBindPlayer(session, serverName)
    })
  ctx.command('解除绑定 [serverName:text]', '解绑玩家')
    .option('force', '-f', { fallback: false })
    .shortcut('强制解绑玩家', { options: { force: true } })
    .shortcut('强制解除绑定', { options: { force: true } })
    .userFields(['tsugu'])
    .action(async ({ session, options }, serverName) => {
      return await commandUnbindPlayer(session, serverName, options.force)
    })
  ctx.command('服务器模式 <serverName:text>', '服务器模式')
    .alias('切换服务器')
    .shortcut(/^(.+)模式$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandSwitchServerMode(session, serverName)
    })
  ctx.command('默认服务器 <...serverList>', '默认服务器')
    .alias('切换默认服务器')
    .userFields(['tsugu'])
    .action(async ({ session }, ...serverList) => {
      return await commandSwitchDefaultServer(session, serverList)
    })
  ctx.command('玩家状态 [serverName:text]', '玩家状态')
    .shortcut(/^(.+)玩家状态$/, { args: ['$1'] })
    .userFields(['tsugu'])
    .action(async ({ session }, serverName) => {
      return await commandPlayerInfo(session, serverName)
    })


  ctx.command("查卡 <word:text>", "查卡")
    .userFields(['tsugu'])
    .action(async ({ session }, text) => {
      return await commandCard(session, text)
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

  ctx.command("ycx <tier:number> [serverName] [eventId:number]", "ycx")
    .userFields(['tsugu'])
    .action(async ({ session }, tier, serverName, eventId) => {
      return await commandYcx(session, tier, serverName, eventId)
    })
  ctx.command("ycxall [serverName] [eventId:number]", "ycxall")
    .userFields(['tsugu'])
    .action(async ({ session }, serverName, eventId) => {
      return await commandYcxAll(session, serverName, eventId)
    })

  ctx.command("抽卡 <word:text>")
    .channelFields(["tsugu_gacha"])
    .action(async ({ session }, text) => {
      const roles = session?.author.roles
      if (roles.includes('admin') || roles.includes('owner')) {
        switch (text) {
          case "on":
          case "开启":
            session.channel.tsugu_gacha = true
            return h.at(session.uid) + "关闭成功"
          case "off":
          case "关闭":
            session.channel.tsugu_gacha = false
            return h.at(session.uid) + "开启成功"
        }
      }
    })
}




console.log("time:" + new Date().toLocaleString());