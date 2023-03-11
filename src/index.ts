import { Context, Schema } from 'koishi'

export const name = 'tsugu-bangdream-bot'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
   // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
   ctx.on('message', (session) => {
    if (session.content === '天王盖地虎') {
      session.send('宝塔镇河妖')
    }
  })
}
