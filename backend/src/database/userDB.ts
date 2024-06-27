import { MongoClient, ObjectId } from 'mongodb';
import { globalServerPriority, globalDefaultServer } from '@/config';
import { Server } from '@/types/Server';
import { isServer, isServerList } from '@/types/Server';


export class UserDB {
  private client: MongoClient;
  private db: any;


  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
    //尝试连接数据库，如果连接失败则抛出错误
    this.connect().catch((err) => {
      throw new Error(`连接数据库失败 Error: ${err.message}`);
    });
  }

  private getCollection() {
    return this.db.collection('users_1');
  }

  private getKey(platform: string, userId: string): string {
    if (platform == 'onebot' || platform == 'chronocat') {
      platform = 'red';
    }
    return `${platform}:${userId}`;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async createUser(platform: string, userId: string): Promise<tsuguUser> {
    const key = this.getKey(platform, userId);
    const user = {
      'userId': userId,
      'platform': platform,
      'mainServer': globalServerPriority[0],
      'displayedServerList': globalDefaultServer,
      'shareRoomNumber': true,
      'userPlayerIndex': 0,
      'userPlayerList': [
      ]
    };
    await this.getCollection().insertOne({ _id: key, ...user });
    return user;
  }

  async getUser(platform: string, userId: string): Promise<tsuguUser | null> {
    const key = this.getKey(platform, userId);
    const user = this.getCollection().findOne({ _id: key });
    return user;
  }

  async updateUser(platform: string, userId: string, update: Partial<tsuguUser>): Promise<void> {
    const key = this.getKey(platform, userId);
    const user = await this.getUser(platform, userId);
    //如果用户不存在，抛出错误
    if (user == null) {
      throw new Error('用户不存在');
    }
    if (!isPartialTsuguUser(update)) {
      throw new Error('参数错误');
    }
    if (update['userPlayerList'] != undefined) {
      throw new Error('不允许直接修改绑定信息');
    }
    //如果index大于绑定列表长度或小于0，或者不为整数，抛出错误
    if (update['userPlayerIndex'] != undefined && (update['userPlayerIndex'] >= user.userPlayerList.length || update['userPlayerIndex'] < 0 || !Number.isInteger(update['userPlayerIndex']))) {
      throw new Error('index 越界或不为整数');
    }

    await this.getCollection().updateOne({ _id: key }, { $set: update });
  }

  async updateUserPlayerList(platform: string, userId: string, bindingAction: 'bind' | 'unbind', tsuguUserServer: userPlayerInList, verifyed: boolean): Promise<{ status: string, data: string }> {
    const key = this.getKey(platform, userId);
    const user = await this.getUser(platform, userId);
    //如果用户不存在
    if (user == null) {
      return { status: 'failed', data: '用户不存在' };
    }
    let userPlayerList = user['userPlayerList'];
    //判断是否已经绑定
    const index = userPlayerList.findIndex((item: userPlayerInList) => item.playerId == tsuguUserServer.playerId);
    if (bindingAction == 'bind') {
      if (index != -1) {
        return { status: 'failed', data: '该 player 已被绑定' };
      }
      if (verifyed) {
        userPlayerList.push(tsuguUserServer);
      }

    } else if (bindingAction == 'unbind') {
      if (index == -1) {
        return { status: 'failed', data: '该 player 未被绑定' };
      }
      if (verifyed) {
        userPlayerList.splice(index, 1);
      }
    }
    if (verifyed) {
      await this.getCollection().updateOne({ _id: key }, { $set: { userPlayerList: userPlayerList } });
      return { status: 'success', data: `${bindingAction} ${tsuguUserServer.playerId} 成功` };
    }
  }

  async deleteUser(platform: string, userId: string): Promise<void> {
    const key = this.getKey(platform, userId);
    await this.getCollection().deleteOne({ _id: key });
  }

  async disconnect(): Promise<void> {
    await this.client.close();
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
  if ('userPlayerIndex' in obj && typeof obj.userPlayerIndex !== 'number') {
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

