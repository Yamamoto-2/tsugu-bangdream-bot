/**
 * Event Service
 * Business logic for event-related operations
 */

import { Server } from '@/types/Server';
import { Event } from '@/types/Event';
import { FuzzySearchResult, match } from '@/lib/fuzzy-search';
import { getEvents, getCharacters } from '@/lib/data-manager';

export class EventService {

    private async loadAllEvents(): Promise<{ [eventId: string]: any }> {
        return getEvents();
    }

    private async loadCharacterBandIdMap(): Promise<Map<number, number>> {
        const charactersData = await getCharacters();
        const bandIdMap = new Map<number, number>();
        for (const characterId in charactersData) {
            const characterData = charactersData[characterId];
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
     * Search events by FuzzySearchResult
     */
    async searchEvents(fuzzySearchResult: FuzzySearchResult, displayedServerList: Server[]): Promise<Event[]> {
        try {
            const eventsData = await this.loadAllEvents();
            const characterBandIdMap = await this.loadCharacterBandIdMap();
            const matchedEvents: Event[] = [];

            for (const eventId in eventsData) {
                const eventData = eventsData[eventId];
                const event = new Event(parseInt(eventId), eventData, characterBandIdMap);

                if (!event.isExist) {
                    continue;
                }

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
        const numberTypeKeys = ['eventId', 'bandId', 'characterId'];
        let basicMatch = match(fuzzyResult, event, numberTypeKeys);

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
                        if (startAt - 1000 * 60 * 60 * 24 <= time && endAt >= time) {
                            activeEventIds.push(parseInt(eventId));
                        }
                        else if (endAt <= time) {
                            endedEventIds.push(parseInt(eventId));
                        }
                    }
                }
            }

            if (activeEventIds.length > 0) {
                const lastActiveId = activeEventIds[activeEventIds.length - 1];
                return await this.getEventById(lastActiveId);
            }

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
     * Get all events available in displayed servers, sorted by eventId desc
     */
    async getRecentEvents(displayedServerList: Server[]): Promise<Event[]> {
        try {
            const eventsData = await this.loadAllEvents();
            const characterBandIdMap = await this.loadCharacterBandIdMap();
            const events: Event[] = [];

            for (const eventId in eventsData) {
                const event = new Event(parseInt(eventId), eventsData[eventId], characterBandIdMap);
                if (!event.isExist) continue;

                const isAvailable = displayedServerList.some(server =>
                    event.startAt[server] != null && event.endAt[server] != null
                );
                if (isAvailable) {
                    events.push(event);
                }
            }

            events.sort((a, b) => b.eventId - a.eventId);
            return events;
        } catch (e) {
            console.error('Failed to get recent events:', e);
            return [];
        }
    }

    getEventStatus(event: Event, server: Server, time?: number): 'not_start' | 'in_progress' | 'ended' {
        return event.getEventStatus(server, time);
    }
}
