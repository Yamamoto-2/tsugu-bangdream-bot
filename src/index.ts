import { Context, Schema, h, Session, Command } from 'koishi'
import { commandCard } from './commands/searchCard'
import { commandEvent } from './commands/searchEvent'
import { commandSong } from './commands/searchSong'
import { commandGacha } from './commands/searchGacha'
import { commandYcx } from './commands/ycx'
import { commandSearchPlayer } from './commands/searchPlayer'
import { commandYcxAll } from './commands/ycxAll'
import { BindingStatus, PlayerBinding, getPlayerBinding, upsertPlayerBinding } from './db/PlayerBinding'
import { commandGroupSetting } from './commands/groupSetting'

export const name = 'tsugu-bangdream-bot'

declare module 'koishi' {
  interface Tables {
    tsugu_player_data: PlayerBinding
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
  // 创建玩家绑定数据库
  ctx.model.extend('tsugu_player_data',
    {
      id: 'unsigned',
      user_id: 'unsigned',
      platform: 'string',
      server_mode: 'unsigned',
      default_server: 'list',
      car: 'boolean',
      server_list: 'json'
    },
    {
      autoInc: true
    })

  // 扩展 channel 表存储群聊中的开关
  ctx.model.extend("channel",
    {
      tsugu_gacha: { type: 'boolean', initial: true }
    })

  ctx.command('查玩家 <playerId:number> <serverName:text>', '查询玩家')
    .action(async (argv, playerId, serverName) => {
      return await commandSearchPlayer(argv, playerId, serverName)
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