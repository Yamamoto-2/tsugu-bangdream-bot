import { Config, Server } from '../config';
import { getDataFromBackend } from './getDataFromBackend'

export async function getFuzzySearchResult(config: Config, text: string): Promise<object> {
    const result = await getDataFromBackend(`${config.backendUrl}/fuzzySearch`, {
        text
    })
    return result;
}

export async function serverNameFuzzySearchResult(config: Config, serverNameText: string): Promise<number> {
    const result = await getFuzzySearchResult(config, serverNameText);
    if (result && result['server']) {
        return result['server'][0] as number;
    }
    return -1;
}