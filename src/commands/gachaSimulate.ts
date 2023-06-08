import { drawRandomGacha } from '../view/gachaSimulate';
import { Context, Schema, h, Session } from 'koishi';
import { Gacha, getPresentGachaList } from '../types/Gacha';

export async function commandGachaSimulate(session: Session<'tsugu', 'tsugu_gacha'>, times: number = 10, gachaId?: number) {
    let gacha: Gacha;
    const default_server = session.user.tsugu.default_server[0]
    if (session.channel.tsugu_gacha) {
        if (!gachaId) {
            gacha = getPresentGachaList(default_server)[0];
        }
        else {
            gacha = new Gacha(gachaId);
            if (!gacha.isExist) {
                return '错误: 该卡池不存在'
            }
        }
        return await drawRandomGacha(gacha, times, default_server);
    }
}

