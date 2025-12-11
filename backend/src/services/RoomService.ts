/**
 * Room Service
 * Business logic for room (车牌) related operations
 * 
 * TODO: Extract business logic from types/Room.ts (queryAllRoom, submitRoomNumber, etc.)
 */

import { Room, RoomOption, roomStack } from '@/types/Room';
import { userPlayerInList } from '@/types/User';
import { logger } from '@/lib/logger';
import { USE_BANDORISTATION } from '@/config/runtime';
import { BandoriStationClient } from '@/lib/clients/BandoriStationClient';

export class RoomService {
    private bandoriStationClient: BandoriStationClient;

    constructor(bandoriStationClient?: BandoriStationClient) {
        this.bandoriStationClient = bandoriStationClient || new BandoriStationClient();
    }

    /**
     * Query all rooms
     * Integrates with BandoriStation API if enabled
     */
    async queryAllRoom(): Promise<Room[]> {
        const roomList = [...roomStack.stack];
        
        // Get rooms from BandoriStation if enabled
        if (USE_BANDORISTATION) {
            const localNumberList = roomList.map((room) => room.number);
            try {
                const roomListBandoriStation = await this.bandoriStationClient.queryRoomNumbers();
                for (let i = 0; i < roomListBandoriStation.length; i++) {
                    const room = roomListBandoriStation[i];
                    if (!localNumberList.includes(room.number)) {
                        roomList.push(room);
                    }
                }
            } catch (e: any) {
                logger('station', `error: ${e.message}`);
            }
        }
        
        // Sort by time (newest first)
        roomList.sort((a, b) => {
            return b.time - a.time;
        });
        
        // Remove rooms older than 150 seconds
        const now = Date.now();
        for (let i = 0; i < roomList.length; i++) {
            const room = roomList[i];
            if (now - room.time > 1000 * 150) {
                roomList.splice(i, 1);
                i--;
            }
        }

        // Deduplicate by room number (keep only the latest)
        const finalRoomList: Room[] = [];
        const numberList: number[] = [];
        for (let i = 0; i < roomList.length; i++) {
            const room = roomList[i];
            if (!numberList.includes(room.number)) {
                numberList.push(room.number);
                finalRoomList.push(room);
            }
        }
        return finalRoomList;
    }


    /**
     * Submit room number
     */
    async submitRoomNumber(
        roomOption: RoomOption,
        userPlayerInList?: userPlayerInList,
        bandoriStationToken?: string
    ): Promise<void> {
        let source = roomOption.source;
        if (source == 'onebot' || source == 'red' || source == 'chronocat') {
            source = 'qq';
        }
        
        const room = new Room({
            ...roomOption,
            source
        });
        
        // Set player if provided
        if (userPlayerInList) {
            room.setPlayer(userPlayerInList);
        }
        
        roomStack.push(room);
        
        // Submit to BandoriStation if enabled
        if (USE_BANDORISTATION && source == 'qq') {
            try {
                await this.bandoriStationClient.submitRoomNumber(roomOption, bandoriStationToken);
            } catch (e: any) {
                logger('station', `error: ${e.message}`);
            }
        }
    }

    /**
     * Filter rooms by keyword
     */
    filterRoomsByKeyword(rooms: Room[], keyword?: string): Room[] {
        if (!keyword) {
            return rooms
        }
        
        const keywordLower = keyword.toLowerCase()
        return rooms.filter(room => {
            return room.rawMessage.toLowerCase().includes(keywordLower) ||
                   room.number.toString().includes(keyword)
        })
    }
}

