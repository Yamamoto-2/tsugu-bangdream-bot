import {getDataFromBackend} from './utils'

export async function commandGetCardIllustration(backendUrl:string,cardId: number): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/getCardIllustration`, {
        cardId
    })
}