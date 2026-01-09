/**
 * Song routes (v5 - returns Tsugu Schema)
 */

import express from 'express';
import { body } from 'express-validator';
import { SongService } from '@/services/SongService';
import { buildSongDetailSchema } from '@/schemas/view/song';
import { Server, getServerByServerId, isServer, isServerList } from '@/types/Server';
import { Request, Response } from 'express';

const router = express.Router();
const songService = new SongService();

/**
 * POST /v5/song/detail
 * Returns Tsugu Schema for song detail
 */
router.post('/v5/song/detail',
    [
        body('songId').isInt(),
        body('displayedServerList').optional().custom(isServerList),
    ],
    async (req: Request, res: Response) => {
        const { songId, displayedServerList } = req.body;

        try {
            const song = await songService.getSongById(songId);
            if (!song) {
                return res.status(404).json({ status: 'failed', data: '歌曲不存在' });
            }

            const schema = buildSongDetailSchema(song);
            res.json(schema);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

export { router as songRouter };

