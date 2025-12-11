/**
 * Event Service
 * Business logic for event-related operations
 * Extracted from backend_old routers and types
 */

import { Server } from '@/types/Server';
import { Event } from '@/types/Event';
import { BestdoriClient } from '@/lib/clients/BestdoriClient';
import { Character } from '@/types/Character';
import { fuzzySearch, FuzzySearchResult, match, loadConfig } from '@/lib/fuzzy-search';

export class EventService {
    private bestdoriClient: BestdoriClient;
    private eventsCache: { [eventId: string]: any } | null = null;
    private charactersCache: { [characterId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all events data (cached)
     */
    private async loadAllEvents(): Promise<{ [eventId: string]: any }> {
        if (!this.eventsCache) {
            const eventsData = await this.bestdoriClient.getAllEvents();
            this.eventsCache = eventsData as { [eventId: string]: any };
        }
        return this.eventsCache;
    }

    /**
     * Load all characters data and build bandId map (cached)
     */
    private async loadCharacterBandIdMap(): Promise<Map<number, number>> {
        if (!this.charactersCache) {
            const charactersData = await this.bestdoriClient.getAllCharacters();
            this.charactersCache = charactersData as { [characterId: string]: any };
        }

        const bandIdMap = new Map<number, number>();
        for (const characterId in this.charactersCache) {
            const characterData = this.charactersCache[characterId];
            if (characterData && characterData['bandId'] != null) {
                bandIdMap.set(parseInt(characterId), characterData['bandId']);
            }
        }
        return bandIdMap;
    }

    /**
     * Get event by ID
     */
    async getEventById(eventId: number): Promise<Event | null> {
        try {
            const eventsData = await this.loadAllEvents();
            const eventData = eventsData[eventId.toString()];
            if (!eventData) {
                return null;
            }

            const characterBandIdMap = await this.loadCharacterBandIdMap();
            const event = new Event(eventId, eventData, characterBandIdMap);
            return event.isExist ? event : null;
        } catch (e) {
            console.error('Failed to get event:', e);
            return null;
        }
    }

    /**
     * Search events by keyword using fuzzy search
     */
    async searchEvents(keyword: string, displayedServerList: Server[]): Promise<Event[]> {
        try {
            const fuzzySearchConfig = loadConfig();
            const fuzzySearchResult = fuzzySearch(keyword, fuzzySearchConfig);
            
            const eventsData = await this.loadAllEvents();
            const characterBandIdMap = await this.loadCharacterBandIdMap();
            const matchedEvents: Event[] = [];

            for (const eventId in eventsData) {
                const eventData = eventsData[eventId];
                const event = new Event(parseInt(eventId), eventData, characterBandIdMap);
                
                if (!event.isExist) {
                    continue;
                }

                // Check if event matches fuzzy search criteria
                if (this.matchesFuzzySearch(event, fuzzySearchResult, displayedServerList)) {
                    matchedEvents.push(event);
                }
            }

            return matchedEvents;
        } catch (e) {
            console.error('Failed to search events:', e);
            return [];
        }
    }

    /**
     * Check if event matches fuzzy search criteria
     */
    private matchesFuzzySearch(event: Event, fuzzyResult: FuzzySearchResult, displayedServerList: Server[]): boolean {
        // Basic match using fuzzy search utils
        const numberTypeKeys = ['eventId', 'bandId', 'characterId'];
        let basicMatch = match(fuzzyResult, event, numberTypeKeys);

        // Check if event is available in displayed servers
        if (displayedServerList && displayedServerList.length > 0) {
            const isAvailable = displayedServerList.some(server => 
                event.startAt[server] != null && event.endAt[server] != null
            );
            if (!isAvailable) {
                return false;
            }
        }

        return basicMatch;
    }

    /**
     * Get present event for a server
     * Returns the currently active event, or the most recently ended event if none is active
     */
    async getPresentEvent(server: Server, time?: number): Promise<Event | null> {
        if (!time) {
            time = Date.now();
        }

        try {
            const eventsData = await this.loadAllEvents();
            const characterBandIdMap = await this.loadCharacterBandIdMap();
            const activeEventIds: number[] = [];
            const endedEventIds: number[] = [];

            // Find active events (started within 24 hours before time, and not ended)
            for (const eventId in eventsData) {
                const eventData = eventsData[eventId];
                const event = new Event(parseInt(eventId), eventData, characterBandIdMap);
                
                if (!event.isExist) {
                    continue;
                }

                if (event.startAt[server] != null && event.endAt[server] != null) {
                    const startAt = event.startAt[server];
                    const endAt = event.endAt[server];
                    
                    if (startAt != null && endAt != null) {
                        // Active: started within 24 hours before time, and not ended yet
                        if (startAt - 1000 * 60 * 60 * 24 <= time && endAt >= time) {
                            activeEventIds.push(parseInt(eventId));
                        }
                        // Ended: ended before time
                        else if (endAt <= time) {
                            endedEventIds.push(parseInt(eventId));
                        }
                    }
                }
            }

            // If there are active events, return the last one
            if (activeEventIds.length > 0) {
                const lastActiveId = activeEventIds[activeEventIds.length - 1];
                return await this.getEventById(lastActiveId);
            }

            // Otherwise, return the most recently ended event
            if (endedEventIds.length > 0) {
                const lastEndedId = endedEventIds[endedEventIds.length - 1];
                return await this.getEventById(lastEndedId);
            }

            return null;
        } catch (e) {
            console.error('Failed to get present event:', e);
            return null;
        }
    }

    /**
     * Get event status
     */
    getEventStatus(event: Event, server: Server, time?: number): 'not_start' | 'in_progress' | 'ended' {
        return event.getEventStatus(server, time);
    }
}


