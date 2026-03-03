/**
 * Event routes (returns Tsugu Schema)
 */

import express from 'express';
import { body } from 'express-validator';
import { EventService } from '@/services/EventService';
import { CardService } from '@/services/CardService';
import { buildEventPreviewSchema, buildEventDetailSchema, buildEventListSchema } from '@/schemas/view/event';
import { Server, isServerList } from '@/types/Server';
import { Card } from '@/types/Card';
import { Event } from '@/types/Event';
import { Request, Response } from 'express';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, Language } from '@/i18n';
import { isFuzzySearchResult } from '@/lib/fuzzy-search';
import type { FuzzySearchResult } from '@/lib/fuzzy-search';

const router = express.Router();
const eventService = new EventService();
const cardService = new CardService();

/**
 * POST /v1/event/list
 * 返回活动列表 Tsugu Schema
 * - 传 eventId: 渲染指定活动 (number[])
 * - 传 fuzzySearchResult: 用模糊搜索结果过滤活动
 * - 都不传: 返回最近 50 个活动
 */
router.post('/v1/event/list',
    [
        body('eventId').optional().isArray(),
        body('eventId.*').optional().isInt(),
        body('fuzzySearchResult').optional().custom(isFuzzySearchResult),
        body('displayedServerList').optional().custom(isServerList),
        body('mode').optional().isIn(['card', 'table']),
        body('language').optional().isIn(SUPPORTED_LANGUAGES),
    ],
    async (req: Request, res: Response) => {
        const { eventId, fuzzySearchResult, displayedServerList, mode, language } = req.body;
        const servers = displayedServerList || [Server.jp];

        try {
            let events: Event[];
            if (eventId && eventId.length > 0) {
                // 根据指定 ID 获取活动
                const results = await Promise.all(
                    eventId.map((id: number) => eventService.getEventById(id))
                );
                events = results.filter((e): e is Event => e !== null);
            } else if (fuzzySearchResult) {
                // 用模糊搜索结果过滤活动
                events = await eventService.searchEvents(fuzzySearchResult, servers);
                events.sort((a, b) => b.eventId - a.eventId);
            } else {
                // 默认返回最近活动
                events = await eventService.getRecentEvents(servers);
            }

            const schema = buildEventListSchema(events, {
                displayedServerList: servers,
                mode: mode || 'card',
                language: (language as Language) || DEFAULT_LANGUAGE,
            });
            res.json(schema);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

/**
 * POST /v1/event/preview
 * Returns Tsugu Schema for event preview
 */
router.post('/v1/event/preview',
    [
        body('eventId').isInt(),
        body('displayedServerList').optional().custom(isServerList),
        body('language').optional().isIn(SUPPORTED_LANGUAGES),
    ],
    async (req: Request, res: Response) => {
        const { eventId, displayedServerList, language } = req.body;

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
 * POST /v1/event/detail
 * Returns Tsugu Schema for event detail
 */
router.post('/v1/event/detail',
    [
        body('eventId').isInt(),
        body('displayedServerList').optional().custom(isServerList),
        body('imageMode').optional().isIn(['url', 'base64']),
        body('language').optional().isIn(SUPPORTED_LANGUAGES),
    ],
    async (req: Request, res: Response) => {
        const { eventId, displayedServerList, imageMode, language } = req.body;

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
                language: (language as Language) || DEFAULT_LANGUAGE,
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
