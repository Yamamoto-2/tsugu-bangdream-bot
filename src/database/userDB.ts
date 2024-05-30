import { Session, h } from "koishi";
import { isServer, isServerList, Server } from '../types/Server';

export async function updateUser(session: Session<'tsugu', never>, update: Partial<tsuguUser>): Promise<void> {
    if (!isPartialTsuguUser(update)) {
        throw new Error('参数错误');
    }
    if (update['userPlayerList'] != undefined) {
        throw new Error('不允许直接修改绑定信息');
    }
    for (const key in update) {
        session.user.tsugu[key] = update[key];
    }
}

export async function updateUserPlayerList(session: Session<'tsugu', never>, bindingAction: 'bind' | 'unbind', tsuguUserServer: userPlayerInList, verifyed: boolean): Promise<void> {
    const user = session.user.tsugu;
    let userPlayerList = user['userPlayerList'];
    const index = userPlayerList.findIndex((item: userPlayerInList) => item.playerId == tsuguUserServer.playerId);
    if (bindingAction == 'bind') {
        if (index != -1) {
            throw new Error('该 player 已经绑定');
        }
        if (verifyed) {
            userPlayerList.push(tsuguUserServer);
        }

    } else {
        if (index == -1) {
            throw new Error('该 player 未绑定');
        }
        if (verifyed) {
            userPlayerList.splice(index, 1);
        }
    }
}



// 判断tsuguUser函数 (in key of tsuguUser)
export function isPartialTsuguUser(obj: any): obj is Partial<tsuguUser> {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    if ('userId' in obj && typeof obj.userId !== 'string') {
        return false;
    }

    if ('platform' in obj && typeof obj.platform !== 'string') {
        return false;
    }

    if ('mainServer' in obj && !isServer(obj.mainServer)) {
        return false;
    }

    if ('displayedServerList' in obj && !isServerList(obj.displayedServerList)) {
        return false;
    }

    if ('shareRoomNumber' in obj && typeof obj.shareRoomNumber !== 'boolean') {
        return false;
    }

    if ('userPlayerList' in obj) {
        if (!Array.isArray(obj.userPlayerList)) {
            return false;
        }

        for (const item of obj.userPlayerList) {
            if (!isUserPlayerInList(item)) {
                return false;
            }
        }
    }

    // 如果所有存在的属性都通过了检查，则返回 true
    return true;
}

export function isUserPlayerInList(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    if (typeof obj.playerId !== 'number') {
        return false;
    }
    if (!isServer(obj.server)) {
        return false;
    }

    return true;
}

export interface tsuguUser {
    userId: string,
    platform: string,
    mainServer: Server,
    displayedServerList: Server[],
    shareRoomNumber: boolean,
    userPlayerIndex: number,
    userPlayerList: userPlayerInList[],
}

export interface userPlayerInList {
    playerId: number,
    server: Server,
}

export function getUserPlayerByUser(tsuguUser: tsuguUser, server?: Server): userPlayerInList {
    server ??= tsuguUser.mainServer;
    const userPlayerList = tsuguUser.userPlayerList;
    //如果用户未绑定角色
    if (userPlayerList.length == 0) {
        throw new Error('用户未绑定player');
    }
    //如果index的player在主服务器上，直接返回
    if (tsuguUser.userPlayerList[tsuguUser.userPlayerIndex].server == server) {
        return userPlayerList[tsuguUser.userPlayerIndex];
    }
    //如果index的player不在主服务器上，遍历查找第一个在主服务器上的player
    for (let i = 0; i < userPlayerList.length; i++) {
        const userPlayerInList: userPlayerInList = userPlayerList[i];
        if (userPlayerInList.server == server) {
            return userPlayerInList;
        }
    }
    //如果没有在主服务器上的player
    throw new Error('用户在对应服务器上未绑定player');
}

