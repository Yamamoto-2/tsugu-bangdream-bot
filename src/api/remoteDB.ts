import axios from 'axios';
import { tsuguUser } from '../config';
import { Logger } from 'koishi'
export const remoteDBLogger = new Logger('tsugu-remoteDB');
import { Config } from '../config'

function parseError(e: any): { status: string; data: string; } {
    //如果404，且报错原因为user api is not available，则说明是本地数据库未开启
    if (e.response?.status == 404 && e.response?.data?.data == '错误: 服务器未启用数据库') {
        return {
            status: 'fail',
            data: '错误: 远程服务器未启用数据库'
        }
    }
    remoteDBLogger.error(e.response)
    return {
        status: 'fail',
        data: e.response?.data?.data || '错误: 远程服务器未知错误\n或无法连接至服务器'
    }
}

export async function getRemoteDBUserData(RemoteDBUrl: string, platform: string, userId: string): Promise<{ status: string; data: tsuguUser | string; }> {
    try {
        const postPath = '/user/getUserData';
        const postData = { platform, userId };
        remoteDBLogger.info(`${RemoteDBUrl}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBUrl}${postPath}`, postData);
        if (result.status != 200) {
            throw new Error()
        }
        return result.data as { status: string; data: tsuguUser };
    }
    catch (e) {
        return parseError(e);
    }
}

export async function changeUserData(RemoteDBUrl: string, platform: string, userId: string, update: Partial<tsuguUser>): Promise<{ status: string; data: string; }> {
    try {
        const postPath = '/user/changeUserData';
        const postData = { platform, userId, update }
        remoteDBLogger.info(`${RemoteDBUrl}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBUrl}${postPath}`, postData);
        if (result.status != 200) {
            throw new Error()
        }
        return result.data;
    }
    catch (e) {
        return parseError(e);
    }
}


export async function bindPlayerRequest(RemoteDBUrl: string, platform: string, userId: string): Promise<{ status: string; data: string | { verifyCode: number }; }> {
    try {
        const postPath = '/user/bindPlayerRequest';
        const postData = { platform, userId }
        remoteDBLogger.info(`${RemoteDBUrl}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBUrl}${postPath}`, postData);
        if (result.status != 200) {
            throw new Error()
        }
        return result.data;
    }
    catch (e) {
        return parseError(e);
    }
}

export async function bindPlayerVerify(RemoteDBUrl: string, platform: string, userId: string, server: number, playerId: number, bindingAction: 'bind' | 'unbind'): Promise<{ status: string; data: string; }> {
    try {
        const postPath = '/user/bindPlayerVerification';
        const postData = { platform, userId, server, playerId, bindingAction }
        remoteDBLogger.info(`${RemoteDBUrl}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBUrl}${postPath}`, postData);
        if (result.status != 200) {
            throw new Error()
        }
        return result.data;
    }
    catch (e) {
        return parseError(e);
    }
}
