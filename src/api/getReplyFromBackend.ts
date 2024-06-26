import axios, { AxiosResponse, AxiosError } from 'axios';
import { Logger } from 'koishi'
export const getReplyFromBackendLogger = new Logger('tsugu-getReplyFromBackend');

function base64ToList(basd64List: Array<{ type: 'string' | 'base64', string: string }>): Array<Buffer | string> {
    const result: Array<Buffer | string> = []
    for (let i = 0; i < basd64List.length; i++) {
        const element = basd64List[i];
        if (element.type == 'string') {
            result.push(element.string)
        }
        else if (element.type == 'base64') {
            result.push(Buffer.from(element.string, 'base64'))
        }
    }
    return result
}

async function sendPostRequest(url: string, data: any): Promise<Object> {
    try {
        const response: AxiosResponse = await axios.post(url, data);
        const result: any = response.data as Object;
        switch (response.status) {
            case 200:
                // 将下载的 JSON 文件转换为对象
                return result;
            case 400:
                return [{
                    type: 'string',
                    string: `错误: 请求参数错误, 可能因为版本与后端服务器版本不一致`
                }];
            case 404:
                return [{
                    type: 'string',
                    string: `错误: 无法连接至后端服务器`
                }];
            case 422:
                return [{
                    type: 'string',
                    string: `错误: 无效的请求 (${result})`
                }];
            case 500:
                return [{
                    type: 'string',
                    string: `内部错误`
                }];
            default:
                return [{
                    type: 'string',
                    string: `错误: 未知错误`
                }];
        }
    } catch (error) {
        // 在此处处理错误
        if (axios.isAxiosError(error)) {
            // 处理由 Axios 抛出的错误
            console.error('Axios Error:', error.message);
            return [{
                type: 'string',
                string: '错误: 后端服务器连接出错'
            }];
        } else {
            // 处理其他错误
            console.error('Error:', error.message);
        }
        return [{
            type: 'string',
            string: '内部错误'
        }];
    }
}

export async function getReplyFromBackend(url: string, data: any): Promise<Array<Buffer | string>> {
    getReplyFromBackendLogger.info(url, data)
    const result: any = await sendPostRequest(url, data);
    return base64ToList(result)
}