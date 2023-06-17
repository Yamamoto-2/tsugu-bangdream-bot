import { drawRandomGacha } from '../view/gachaSimulate';
import { Gacha, getPresentGachaList } from '../types/Gacha';
import { Server } from '../types/Server';

export async function commandGachaSimulate(default_server: Server, status: boolean, times: number = 10, gachaId?: number):Promise<Array<Buffer | string>> {
    let gacha: Gacha;
    if (status) {
        if (!gachaId) {
            gacha = getPresentGachaList(default_server)[0];
        }
        else {
            gacha = new Gacha(gachaId);
            if (!gacha.isExist) {
                return ['错误: 该卡池不存在'];
            }
        }
        return await drawRandomGacha(gacha, times, default_server);
    }
}

