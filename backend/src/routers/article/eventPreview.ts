import { listToBase64 } from '@/routers/utils';
import express from 'express';
import { validationResult, body } from 'express-validator';
import { drawEventPreviewBanner } from '@/view/article/eventPreview/eventPreviewBanner';
import { drawEventPreviewTitle } from '@/view/article/eventPreview/eventPreviewTitle';
import { drawEventPreviewRules } from '@/view/article/eventPreview/eventPreviewRules';
import { drawEventPreviewCards } from '@/view/article/eventPreview/eventPreviewCards';
import { drawEventPreviewSongs } from '@/view/article/eventPreview/eventPreviewSongs';
import { drawEventPreviewGacha } from '@/view/article/eventPreview/eventPreviewGacha';

const router = express.Router();

//eventPreviewBanner
router.post('/eventPreviewBanner', [
    body('eventId').isInt(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, JSON.stringify(req.body));
    try {
        const result = await drawEventPreviewBanner(req.body.eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventPreviewTitle
router.post('/eventPreviewTitle', [
    body('eventId').isInt(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, JSON.stringify(req.body));
    try {
        const result = await drawEventPreviewTitle(req.body.eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventPreviewRules
router.post('/eventPreviewRules', [
    body('eventId').isInt(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, JSON.stringify(req.body));
    try {
        const result = await drawEventPreviewRules(req.body.eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventPreviewCards
router.post('/eventPreviewCards', [
    body('eventId').isInt(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, JSON.stringify(req.body));
    try {
        const result = await drawEventPreviewCards(req.body.eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventPreviewSongs
router.post('/eventPreviewSongs', [
    body('eventId').isInt(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, JSON.stringify(req.body));
    try {
        const result = await drawEventPreviewSongs(req.body.eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventPreviewGacha
router.post('/eventPreviewGacha', [
    body('eventId').isInt(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, JSON.stringify(req.body));
    try {
        const result = await drawEventPreviewGacha(req.body.eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export { router as eventPreviewRouter }