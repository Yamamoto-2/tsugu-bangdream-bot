import { Context, Schema, h, Session } from 'koishi'

export const name = 'tsugu-bangdream-bot'

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

import { commandCard } from './commands/searchCard'
import { commandEvent } from './commands/searchEvent'
import { commandSong } from './commands/searchSong'
import { commandGacha } from './commands/searchGacha'
import { commandYcx } from './commands/ycx'
import { commandSearchPlayer } from './commands/searchPlayer'

export function apply(ctx: Context) {
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





}




console.log("time:" + new Date().toLocaleString());