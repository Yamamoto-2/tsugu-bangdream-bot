/**
 * Room Service
 * Business logic for room (车牌) related operations
 * 
 * TODO: Extract business logic from types/Room.ts (queryAllRoom, submitRoomNumber, etc.)
 */

import { Room, RoomOption, roomStack } from '@/types/Room';
import { userPlayerInList } from '@/types/User';
import { logger } from '@/utils/logger';
import { USE_BANDORISTATION } from '@/config/runtime';
import { BandoriStationurl } from '@/config/constants';
import axios from 'axios';

export class RoomService {
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
                const roomListBandoriStation = await this.queryRoomNumberFromBandoriStation();
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
     * Query rooms from BandoriStation API
     */
    private async queryRoomNumberFromBandoriStation(): Promise<Room[]> {
        const Data = await axios.post(BandoriStationurl, { function: 'query_room_number' });
        const response = Data.data?.response;
        const roomList: Room[] = [];
        
        for (let i = 0; i < response.length; i++) {
            const roomData = response[i];
            let source = this.decodeUrl(roomData['source_info']['name']);
            const room = new Room({
                number: Number(roomData['number']),
                rawMessage: this.decodeUrl(roomData['raw_message']),
                source: source,
                userName: this.decodeUrl(roomData['user_info']['username']),
                userId: roomData['user_info']['user_id'],
                time: roomData['time'],
                avatarUrl: roomData['user_info']['avatar'] == '' 
                    ? undefined 
                    : `https://asset.bandoristation.com/images/user-avatar/${roomData['user_info']['avatar']}`
            });
            
            // Set player if available
            if (roomData['user_info']?.['bandori_player_brief_info']?.['user_id'] != undefined) {
                const playerInfo = roomData['user_info']['bandori_player_brief_info'];
                room.setPlayer({
                    playerId: playerInfo['user_id'],
                    server: this.getServerByName(playerInfo['server'])
                });
            }
            roomList.push(room);
        }
        return roomList;
    }

    private decodeUrl(text: string): string {
        if (text == undefined) {
            return '';
        }
        const { unescape } = require('querystring');
        return unescape(text.replace(/\%u/g, "%u"));
    }

    private getServerByName(name: string): any {
        // TODO: Import from types/Server
        const { getServerByName } = require('@/types/Server');
        return getServerByName(name);
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
            const token = bandoriStationToken || 'ZtV4EX2K9Onb';
            const url = BandoriStationurl;
            const data = {
                function: 'submit_room_number',
                number: roomOption.number,
                user_id: roomOption.userId,
                raw_message: roomOption.rawMessage,
                source: 'Tsugu',
                token: token
            };
            try {
                await axios.post(url, data);
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

