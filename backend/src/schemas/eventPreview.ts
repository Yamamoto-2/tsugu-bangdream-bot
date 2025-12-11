/**
 * Event Preview Schema Builder
 * Builds Tsugu Schema for event preview pages
 * 
 * Input: Event data from EventService
 * Output: Tsugu Schema JSON
 */

import { Event } from '@/types/Event';

/**
 * Build event preview schema
 * TODO: Implement based on Tsugu v5 design document
 */
export function buildEventPreviewSchema(event: Event): any {
    return {
        schemaVersion: "1.0",
        componentName: "Page",
        id: `event-preview-${event.eventId}`,
        props: {
            title: `活动 ${event.eventId} 预览`
        },
        style: {
            background: "surface"
        },
        children: [
            {
                componentName: "Card",
                id: "event-summary-card",
                props: {
                    title: "活动概要"
                },
                style: {
                    variant: "primary",
                    padding: "md"
                },
                children: [
                    {
                        componentName: "EventSummary",
                        id: "event-summary-main",
                        props: {
                            eventId: event.eventId,
                            eventName: event.eventName,
                            eventType: event.eventType,
                            startAt: event.startAt,
                            endAt: event.endAt
                        }
                    }
                ]
            }
            // TODO: Add more components (rules, songs, cards, gacha, etc.)
        ]
    };
}

