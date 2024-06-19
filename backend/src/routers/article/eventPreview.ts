import { listToBase64 } from '@/routers/utils';
import express from 'express';
import { body } from 'express-validator';
import { middleware } from '@/routers/middleware';
import { drawEventPreviewTitle } from '@/view/article/eventPreview/eventPreviewTitle';
import { drawEventPreviewDetail } from '@/view/article/eventPreview/eventPreviewDetail';
import { drawEventPreviewRules } from '@/view/article/eventPreview/eventPreviewRules';
import { drawEventPreviewCards } from '@/view/article/eventPreview/eventPreviewCards';
import { drawEventPreviewSongs } from '@/view/article/eventPreview/eventPreviewSongs';
import { drawEventPreviewGacha } from '@/view/article/eventPreview/eventPreviewGacha';

const router = express.Router();

// Middleware for error handling
const handleError = (e, res) => {
    console.log(e);
    res.send([{ type: 'string', string: '内部错误' }]);
};

// Generic route handler
const handleEventPreview = (drawFunction) => async (req, res) => {
    try {
        const result = await drawFunction(req.body.eventId, req.body.illustration);
        res.send(listToBase64(result));
    } catch (e) {
        handleError(e, res);
    }
};

// Define route with the specific function
router.post('/eventPreviewTitle', [body('eventId').isInt()], middleware, handleEventPreview(drawEventPreviewTitle));
router.post('/eventPreviewDetail', [body('eventId').isInt()], middleware, handleEventPreview(drawEventPreviewDetail));
router.post('/eventPreviewRules', [body('eventId').isInt()], middleware, handleEventPreview(drawEventPreviewRules));
router.post('/eventPreviewCards', [body('eventId').isInt(), middleware, body('illustration').optional().isBoolean()], handleEventPreview(drawEventPreviewCards));
router.post('/eventPreviewSongs', [body('eventId').isInt()], middleware, handleEventPreview(drawEventPreviewSongs));
router.post('/eventPreviewGacha', [body('eventId').isInt()], middleware, handleEventPreview(drawEventPreviewGacha));


export { router as eventPreviewRouter }