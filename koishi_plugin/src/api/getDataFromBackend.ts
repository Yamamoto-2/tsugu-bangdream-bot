import * as axios from 'axios';
import { Logger } from 'koishi'
export const getDataFromBackendLogger = new Logger('tsugu-getDataFromBackend');

export async function getDataFromBackend(url: string, data: Object): Promise<object> {
    getDataFromBackendLogger.info(url, data)
    const result = await axios.default.post(url, data)
    if (result?.data?.status != 'success') {
        return {};
    }
    //console.log(result.data.data)
    return result.data.data;
}