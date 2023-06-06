import { Context, Schema, h, Session, Command, User } from 'koishi'
import { commandCard } from './commands/searchCard'
import { commandEvent } from './commands/searchEvent'
import { commandSong } from './commands/searchSong'
import { commandGacha } from './commands/searchGacha'
import { commandYcx } from './commands/ycx'
import { commandSearchPlayer } from './commands/searchPlayer'
import { commandYcxAll } from './commands/ycxAll'
import { PlayerBinding } from './db/PlayerBinding'
import { commandGroupSetting } from './commands/groupSetting'
import { commandBindPlayer } from './commands/bindPlayer'
import { Server } from './types/Server'
import { defaultserver } from './config'

export const name = 'tsugu-bangdream-bot'

declare module 'koishi' {
  interface User {
    tsugu_user_id: string,
    tsugu_platform: string,
    tsugu_server_mode: Server,
    tsugu_default_server: Server[],
    tsugu_car: boolean,
    tsugu_server_list: Server[]
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
      tsugu_user_id: 'string',
      tsugu_platform: 'string',
      tsugu_server_mode: { type: 'unsigned', initial: defaultserver[0] },
      tsugu_default_server: { type: 'list', initial: defaultserver },
      tsugu_car: { type: 'boolean', initial: true },
      tsugu_server_list: { type: 'list', initial: [0, 0, 0, 0, 0] }
    },
    {
      autoInc: true
    })

  // 扩展 channel 表存储群聊中的查卡开关
  ctx.model.extend("channel",
    {
      tsugu_gacha: { type: 'boolean', initial: true }
    })


  ctx.command('查玩家 <playerId:number> <serverName:text>', '查询玩家')
    .action(async (argv, playerId, serverName) => {
      return await commandSearchPlayer(argv, playerId, serverName)
    })
  ctx.command('绑定玩家 [serverName:text]')
    .userFields(['tsugu_user_id', 'tsugu_platform', 'tsugu_server_mode', 'tsugu_default_server', 'tsugu_car', 'tsugu_server_list'])
    .action(async ({ session }, serverName) => {
      return await commandBindPlayer(session, serverName)
    })

  ctx.command("查卡 <word:text>", "查卡")
    .action(async (argv, text) => {
      return await commandCard(argv, text)
    })
  ctx.command("查活动 <word:text>", "查活动")
    .action(async (argv, text) => {
      return await commandEvent(argv, text)
    })
  ctx.command("查曲 <word:text>", "查曲")
    .action(async (argv, text) => {
      return await commandSong(argv, text)
    })
  ctx.command("查卡池 <word:text>", "查卡池")
    .action(async (argv, text) => {
      return await commandGacha(argv, text)
    })

  ctx.command("ycx <tier:number> [serverName] [eventId:number]", "ycx")
    .action(async (argv, tier, serverName, eventId) => {
      return await commandYcx(argv, tier, serverName, eventId)
    })
  ctx.command("ycxall [serverName] [eventId:number]", "ycxall")
    .action(async (argv, serverName, eventId) => {
      return await commandYcxAll(argv, serverName, eventId)
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