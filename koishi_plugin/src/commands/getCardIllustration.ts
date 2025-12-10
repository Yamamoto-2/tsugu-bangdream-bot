import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandGetCardIllustration(config: Config, cardId: number): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/getCardIllustration`, {
        cardId
    })
}