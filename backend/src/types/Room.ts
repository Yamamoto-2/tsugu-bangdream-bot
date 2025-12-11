/**
 * Room domain type
 * Migrated from backend_old/src/types/Room.ts
 * Removed: HTTP calls (queryRoomNumberFromBandoriStation, submitRoomNumber)
 * 
 * Note: Room management logic moved to RoomService
 */

import { userPlayerInList } from './User';
import { Stack } from './utils';

export interface RoomOption {
    number: number;
    rawMessage: string;
    source: string;
    userId: string;
    time: number;
    avatarUrl?: string;
    userName?: string;
    bandoriStationToken?: string;
}

export class Room {
    number: number;
    rawMessage: string;
    source: string;
    userId: string;
    time: number;
    player?: userPlayerInList;
    avatarUrl?: string;
    userName?: string;

    constructor({ number, rawMessage, source, userId, time, avatarUrl, userName }: RoomOption) {
        this.number = number;
        this.rawMessage = rawMessage;
        this.source = source;
        this.userId = userId;
        this.time = time;
        this.avatarUrl = avatarUrl;
        this.userName = userName;
    }

    setPlayer(player: userPlayerInList): void {
        this.player = player;
    }
}

/**
 * Room stack for in-memory storage
 * TODO: This should be managed by RoomService
 */
export const roomStack = new Stack<Room>(100);
