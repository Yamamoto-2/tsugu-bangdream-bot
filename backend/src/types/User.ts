/**
 * User domain types
 * Migrated from backend_old/src/database/userDB.ts (type definitions)
 */

import { Server, isServer, isServerList } from './Server';

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

/**
 * Validate if object is partial tsuguUser
 */
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

  return true;
}

/**
 * Validate if object is userPlayerInList
 */
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

/**
 * Get user player by user and server
 */
export function getUserPlayerByUser(tsuguUser: tsuguUser, server?: Server): userPlayerInList {
  server ??= tsuguUser.mainServer;
  const userPlayerList = tsuguUser.userPlayerList;
  
  if (userPlayerList.length == 0) {
    throw new Error('用户未绑定player');
  }
  
  if (tsuguUser.userPlayerList[tsuguUser.userPlayerIndex].server == server) {
    return userPlayerList[tsuguUser.userPlayerIndex];
  }
  
  for (let i = 0; i < userPlayerList.length; i++) {
    const userPlayerInList: userPlayerInList = userPlayerList[i];
    if (userPlayerInList.server == server) {
      return userPlayerInList;
    }
  }
  
  throw new Error('用户在对应服务器上未绑定player');
}

