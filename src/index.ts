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

import { test } from './test';
import { drawCardDetail } from './commands/card'

export function apply(ctx: Context) {
  // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
  ctx.on('message', (session: Session) => {
    if (session.content === 'test') {
      test(session)
    }
  })
  ctx.command("查卡 <word:text>", "查卡")
    .action(async (argv, text) => {
      console.log(text)
      console.log(argv)
      if(Number.isInteger(parseInt(text))){
        var buffer = await drawCardDetail(parseInt(text))
        return h.image(buffer, 'image/png');
      }
    })
}




console.log("time:" + new Date().toLocaleString());