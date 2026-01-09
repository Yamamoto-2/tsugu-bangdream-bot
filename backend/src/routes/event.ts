/**
 * Event routes (v5 - returns Tsugu Schema)
 * 
 * TODO: Implement full route handlers that:
 * 1. Parse HTTP parameters
 * 2. Call EventService
 * 3. Call Schema builders
 * 4. Return JSON Schema
 */

import express from 'express';
import { body } from 'express-validator';
import { EventService } from '@/services/EventService';
import { buildEventPreviewSchema, buildEventDetailSchema } from '@/schemas/view/event';
import { Server, getServerByServerId, isServer, isServerList } from '@/types/Server';
import { Request, Response } from 'express';

const router = express.Router();
const eventService = new EventService();

/**
 * GET /v5/event/preview
 * Returns Tsugu Schema for event preview
 */
router.post('/v5/event/preview',
    [
        body('eventId').isInt(),
        body('displayedServerList').optional().custom(isServerList),
    ],
    async (req: Request, res: Response) => {
        const { eventId, displayedServerList } = req.body;

        try {
            const event = await eventService.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ status: 'failed', data: '活动不存在' });
            }

            const schema = buildEventPreviewSchema(event);
            res.json(schema);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

/**
 * POST /v5/event/detail
 * Returns Tsugu Schema for event detail
 */
router.post('/v5/event/detail',
    [
        body('eventId').isInt(),
        body('displayedServerList').optional().custom(isServerList),
        body('imageMode').optional().isIn(['url', 'base64']),
    ],
    async (req: Request, res: Response) => {
        const { eventId, displayedServerList, imageMode } = req.body;

        try {
            const event = await eventService.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ status: 'failed', data: '活动不存在' });
            }

            const schema = buildEventDetailSchema(event, {
                displayedServerList: displayedServerList || [Server.jp],
                imageMode: imageMode || 'url'
            });
            res.json(schema);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

export { router as eventRouter };

