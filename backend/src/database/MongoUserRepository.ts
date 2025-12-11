/**
 * MongoDB User Repository Implementation
 * Migrated from backend_old/src/database/userDB.ts
 * 
 * TODO: Collection name, URI, dbName should come from config/runtime.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import { IUserRepository } from './IUserRepository';
import { tsuguUser, userPlayerInList, isPartialTsuguUser, isUserPlayerInList } from '@/types/User';
import { Server } from '@/types/Server';
import { globalServerPriority, globalDefaultServer } from '@/config/constants';

export class MongoUserRepository implements IUserRepository {
  private client: MongoClient;
  private db: any;
  private uri: string;
  private dbName: string;
  private collectionName: string = 'users_1';

  /**
   * Constructor
   * @param uri MongoDB connection URI
   * @param dbName Database name
   */
  constructor(uri: string, dbName: string) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
    
    // Try to connect, throw error if fails
    this.connect().catch((err) => {
      throw new Error(`连接数据库失败 Error: ${err.message}`);
    });
  }

  private getCollection() {
    return this.db.collection(this.collectionName);
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
    const user: tsuguUser = {
      'userId': userId,
      'platform': platform,
      'mainServer': globalServerPriority[0],
      'displayedServerList': globalDefaultServer,
      'shareRoomNumber': true,
      'userPlayerIndex': 0,
      'userPlayerList': []
    };
    await this.getCollection().insertOne({ _id: key, ...user });
    return user;
  }

  async getUser(platform: string, userId: string): Promise<tsuguUser | null> {
    const key = this.getKey(platform, userId);
    const user = await this.getCollection().findOne({ _id: key });
    return user;
  }

  async updateUser(platform: string, userId: string, update: Partial<tsuguUser>): Promise<void> {
    const key = this.getKey(platform, userId);
    const user = await this.getUser(platform, userId);
    
    if (user == null) {
      throw new Error('用户不存在');
    }
    
    if (!isPartialTsuguUser(update)) {
      throw new Error('参数错误');
    }
    
    if (update['userPlayerList'] != undefined) {
      throw new Error('不允许直接修改绑定信息');
    }
    
    if (update['userPlayerIndex'] != undefined && 
        (update['userPlayerIndex'] >= user.userPlayerList.length || 
         update['userPlayerIndex'] < 0 || 
         !Number.isInteger(update['userPlayerIndex']))) {
      throw new Error('index 越界或不为整数');
    }

    await this.getCollection().updateOne({ _id: key }, { $set: update });
  }

  async updateUserPlayerList(
      platform: string,
      userId: string,
      bindingAction: 'bind' | 'unbind',
      tsuguUserServer: userPlayerInList,
      verifyed: boolean
  ): Promise<{ status: string, data: string }> {
    const key = this.getKey(platform, userId);
    const user = await this.getUser(platform, userId);
    
    if (user == null) {
      return { status: 'failed', data: '用户不存在' };
    }
    
    let userPlayerList = user['userPlayerList'];
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
    
    return { status: 'failed', data: '验证失败' };
  }

  async deleteUser(platform: string, userId: string): Promise<void> {
    const key = this.getKey(platform, userId);
    await this.getCollection().deleteOne({ _id: key });
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}

