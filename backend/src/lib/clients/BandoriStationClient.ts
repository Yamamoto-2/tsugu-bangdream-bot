/**
 * BandoriStation API Client
 * Client for interacting with BandoriStation API
 */

import axios from 'axios';
import { BandoriStationurl } from '@/config/constants';
import { logger } from '../logger';
import { Room, RoomOption } from '@/types/Room';
import { getServerByName } from '@/types/Server';

export interface BandoriStationRoomData {
    number: string;
    raw_message: string;
    source_info: {
        name: string;
    };
    user_info: {
        username: string;
        user_id: string;
        avatar: string;
        bandori_player_brief_info?: {
            user_id: string;
            server: string;
        };
    };
    time: number;
}

export interface BandoriStationResponse {
    response: BandoriStationRoomData[];
}

export class BandoriStationClient {
    private baseUrl: string;
    private defaultToken: string;

    constructor(baseUrl: string = BandoriStationurl, defaultToken: string = 'ZtV4EX2K9Onb') {
        this.baseUrl = baseUrl;
        this.defaultToken = defaultToken;
    }

    /**
     * Decode URL-encoded text
     */
    private decodeUrl(text: string): string {
        if (text == undefined) {
            return '';
        }
        const { unescape } = require('querystring');
        return unescape(text.replace(/\%u/g, "%u"));
    }

    /**
     * Query room numbers from BandoriStation
     */
    async queryRoomNumbers(): Promise<Room[]> {
        try {
            const response = await axios.post<BandoriStationResponse>(
                this.baseUrl,
                { function: 'query_room_number' }
            );
            
            const roomList: Room[] = [];
            const responseData = response.data?.response || [];
            
            for (let i = 0; i < responseData.length; i++) {
                const roomData = responseData[i];
                const source = this.decodeUrl(roomData.source_info.name);
                
                const room = new Room({
                    number: Number(roomData.number),
                    rawMessage: this.decodeUrl(roomData.raw_message),
                    source: source,
                    userName: this.decodeUrl(roomData.user_info.username),
                    userId: roomData.user_info.user_id,
                    time: roomData.time,
                    avatarUrl: roomData.user_info.avatar == ''
                        ? undefined
                        : `https://asset.bandoristation.com/images/user-avatar/${roomData.user_info.avatar}`
                });
                
                // Set player if available
                if (roomData.user_info?.bandori_player_brief_info?.user_id != undefined) {
                    const playerInfo = roomData.user_info.bandori_player_brief_info;
                    room.setPlayer({
                        playerId: Number(playerInfo.user_id),
                        server: getServerByName(playerInfo.server)
                    });
                }
                roomList.push(room);
            }
            
            return roomList;
        } catch (e: any) {
            logger('station', `Failed to query room numbers: ${e.message}`);
            throw e;
        }
    }

    /**
     * Submit room number to BandoriStation
     */
    async submitRoomNumber(
        roomOption: RoomOption,
        token?: string
    ): Promise<void> {
        const submitToken = token || this.defaultToken;
        const data = {
            function: 'submit_room_number',
            number: roomOption.number,
            user_id: roomOption.userId,
            raw_message: roomOption.rawMessage,
            source: 'Tsugu',
            token: submitToken
        };
        
        try {
            await axios.post(this.baseUrl, data);
        } catch (e: any) {
            logger('station', `Failed to submit room number: ${e.message}`);
            throw e;
        }
    }
}

