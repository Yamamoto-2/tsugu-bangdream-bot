import axios from 'axios';
import { tsuguUser } from '../config';

function parseError(e: any): { status: string; data: string; } {
    //如果404，且报错原因为user api is not available，则说明是本地数据库未开启
    if (e.response?.status == 404 && e.response?.data?.data == '错误: 服务器未启用数据库') {
        return {
            status: 'fail',
            data: '错误: 远程服务器未启用数据库'
        }
    }
    console.log(e.response)
    return {
        status: 'fail',
        data: e.response?.data?.data || '错误: 远程服务器未知错误\n或无法连接至服务器'
    }
}

export async function getRemoteDBUserData(RemoteDBHost: string, platform: string, user_id: string): Promise<{ status: string; data: tsuguUser | string; }> {
    try {
        const postPath = '/user/getUserData';
        const postData = { platform, user_id };
        console.log(`getDataFromRemoteDB: ${RemoteDBHost}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBHost}${postPath}`, postData);
        if(result.status != 200){
            throw new Error()
        }
        return result.data as { status: string; data: tsuguUser };
    }
    catch (e) {
        return parseError(e);
    }
}

export async function changeUserData(RemoteDBHost: string, platform: string, user_id: string, update: Partial<tsuguUser>): Promise<{ status: string; data: string; }> {
    try {
        const postPath = '/user/changeUserData';
        const postData = { platform, user_id, update }
        console.log(`getDataFromRemoteDB: ${RemoteDBHost}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBHost}${postPath}`, postData);
        if(result.status != 200){
            throw new Error()
        }
        return result.data;
    }
    catch (e) {
        return parseError(e);
    }
}


export async function bindPlayerRequest(RemoteDBHost: string, platform: string, user_id: string, server: number, bindType: boolean): Promise<{ status: string; data: string | { verifyCode: number }; }> {
    try {
        const postPath = '/user/bindPlayerRequest';
        const postData = { platform, user_id, server, bindType }
        console.log(`getDataFromRemoteDB`, `${RemoteDBHost}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBHost}${postPath}`, postData);
        if(result.status != 200){
            throw new Error()
        }
        return result.data;
    }
    catch (e) {
        return parseError(e);
    }
}

//bindType为true时，为绑定请求，为false时，为解绑请求
export async function bindPlayerVerify(RemoteDBHost: string, platform: string, user_id: string, server: number, playerId: number, bindType: boolean): Promise<{ status: string; data: string; }> {
    try {
        const postPath = '/user/bindPlayerVerification';
        const postData = { platform, user_id, server, playerId, bindType }
        console.log(`getDataFromRemoteDB`, `${RemoteDBHost}${postPath}`, postData);
        const result = await axios.post(`${RemoteDBHost}${postPath}`, postData);
        if(result.status != 200){
            throw new Error()
        }
        return result.data;
    }
    catch (e) {
        return parseError(e);
    }
}
