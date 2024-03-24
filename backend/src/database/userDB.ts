import { MongoClient, ObjectId } from 'mongodb';
import { tsuguUser, BindingStatus, globalServerPriority, globalDefaultServer, tsuguUserServerInList } from '@/config';
import { Server } from '@/types/Server';

export class UserDB {
  private client: MongoClient;
  private db: any;


  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
  }

  private getCollection() {
    return this.db.collection('users');
  }

  private getKey(platform: string, userId: string): string {
    if(platform == 'onebot' || platform == 'chronocat') {
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
      'user_id': userId,
      'platform': platform,
      'server_mode': globalServerPriority[0],
      'default_server': globalDefaultServer,
      'car': true,
      'server_list': [
        { playerId: 0, bindingStatus: BindingStatus.None },
        { playerId: 0, bindingStatus: BindingStatus.None },
        { playerId: 0, bindingStatus: BindingStatus.None },
        { playerId: 0, bindingStatus: BindingStatus.None },
        { playerId: 0, bindingStatus: BindingStatus.None }
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
    if (update['server_list'] != undefined) {
      throw new Error('不允许直接修改绑定信息');
    }
    await this.getCollection().updateOne({ _id: key }, { $set: update });
  }

  async updateServerList(platform: string, userId: string, server: Server, tsuguUserServer: tsuguUserServerInList): Promise<void> {
    const key = this.getKey(platform, userId);
    await this.getCollection().updateOne({ _id: key }, { $set: { [`server_list.${server}`]: tsuguUserServer } });
  }

  async deleteUser(platform: string, userId: string): Promise<void> {
    const key = this.getKey(platform, userId);
    await this.getCollection().deleteOne({ _id: key });
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
