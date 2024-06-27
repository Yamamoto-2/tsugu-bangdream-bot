import express from 'express';
import { body } from 'express-validator';
import { middleware } from '@/routers/middleware';
import { drawEventReportCutoffDetail } from '@/view/article/eventReport/eventReportCutoffDetail'
import { drawEventReportPlayerNumber } from '@/view/article/eventReport/eventReportPlayerNumber'
import { drawEventReportCutoffListOfEvent } from '@/view/article/eventReport/eventReportCutoffListOfEvent'
import { drawEventReportTitle } from '@/view/article/eventReport/eventReportTitle'
import { listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';

const router = express.Router();

//eventReportCutoffDetail
router.post('/eventReportCutoffDetail', [
    body('server').custom(value => isServer(value)),
    body('tier').isInt(),
    body('eventId').optional().isInt(),
], middleware, async (req, res) => {
    const { server, tier, eventId } = req.body;
    try {
        const result = await drawEventReportCutoffDetail(eventId, tier, server);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventReportPlayerNumber
router.post('/eventReportPlayerNumber', [
    body('server').custom(value => isServer(value)),
    body('eventId').optional().isInt(),
], middleware, async (req, res) => {
    const { server, eventId } = req.body;
    try {
        const result = await drawEventReportPlayerNumber(eventId, server);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventReportCutoffListOfEvent
router.post('/eventReportCutoffListOfEvent', [
    body('server').custom(value => isServer(value)),
    body('eventId').optional().isInt(),
], async (req, res) => {
    const { server, eventId } = req.body;
    try {
        const result = await drawEventReportCutoffListOfEvent(eventId, server);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

//eventReportTitle
router.post('/eventReportTitle', [
    body('eventId').optional().isInt(),
], async (req, res) => {
    const { eventId } = req.body;
    try {
        const result = await drawEventReportTitle(eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});
export { router as eventReportRouter }