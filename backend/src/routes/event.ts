/**
 * Event routes (v5 - returns Tsugu Schema)
 */

import express from 'express';
import { body } from 'express-validator';
import { EventService } from '@/services/EventService';
import { CardService } from '@/services/CardService';
import { buildEventPreviewSchema, buildEventDetailSchema } from '@/schemas/view/event';
import { Server, isServerList } from '@/types/Server';
import { Card } from '@/types/Card';
import { Request, Response } from 'express';

const router = express.Router();
const eventService = new EventService();
const cardService = new CardService();

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

            // 获取奖励卡牌数据
            const rewardCards: Card[] = [];
            if (event.rewardCards && event.rewardCards.length > 0) {
                for (const cardId of event.rewardCards) {
                    const card = await cardService.getCardById(cardId);
                    if (card) {
                        rewardCards.push(card);
                    }
                }
            }

            const schema = buildEventDetailSchema(event, {
                displayedServerList: displayedServerList || [Server.jp],
                imageMode: imageMode || 'url',
                rewardCards
            });
            res.json(schema);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

export { router as eventRouter };
