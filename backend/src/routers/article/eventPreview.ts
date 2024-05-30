import { listToBase64 } from '@/routers/utils';
import express from 'express';
import { body } from 'express-validator';
import { drawEventPreviewTitle } from '@/view/article/eventPreview/eventPreviewTitle';
import { drawEventPreviewDetail } from '@/view/article/eventPreview/eventPreviewDetail';
import { drawEventPreviewRules } from '@/view/article/eventPreview/eventPreviewRules';
import { drawEventPreviewCards } from '@/view/article/eventPreview/eventPreviewCards';
import { drawEventPreviewSongs } from '@/view/article/eventPreview/eventPreviewSongs';
import { drawEventPreviewGacha } from '@/view/article/eventPreview/eventPreviewGacha';

const router = express.Router();

// Middleware for logging
const logRequest = (req, res, next) => {
    console.log(req.ip, `${req.baseUrl}${req.path}`, JSON.stringify(req.body));
    next();
};

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
router.post('/eventPreviewTitle', [logRequest, body('eventId').isInt()], handleEventPreview(drawEventPreviewTitle));
router.post('/eventPreviewDetail', [logRequest, body('eventId').isInt()], handleEventPreview(drawEventPreviewDetail));
router.post('/eventPreviewRules', [logRequest, body('eventId').isInt()], handleEventPreview(drawEventPreviewRules));
router.post('/eventPreviewCards', [logRequest, body('eventId').isInt(), body('illustration').optional().isBoolean()], handleEventPreview(drawEventPreviewCards));
router.post('/eventPreviewSongs', [logRequest, body('eventId').isInt()], handleEventPreview(drawEventPreviewSongs));
router.post('/eventPreviewGacha', [logRequest, body('eventId').isInt()], handleEventPreview(drawEventPreviewGacha));


export { router as eventPreviewRouter }