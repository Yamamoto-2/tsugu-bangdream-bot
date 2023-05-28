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

export function apply(ctx: Context) {

  ctx.command("查卡 <word:text>", "查卡")
    .action(async (argv, text) => {
      return await commandCard(argv, text)
    }
    )
  ctx.command("查活动 <word:text>", "查活动")
    .action(async (argv, text) => {
      return await commandEvent(argv, text)
    }
    )
  ctx.command("查曲 <word:text>", "查曲")
    .action(async (argv, text) => {
      return await commandSong(argv, text)
    }
    )
}




console.log("time:" + new Date().toLocaleString());