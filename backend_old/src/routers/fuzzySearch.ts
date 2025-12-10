import express from 'express';
import { body } from 'express-validator';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';
import { fuzzySearch } from '@/fuzzySearch';


const router = express.Router();

// Route handling the POST request with validation using express-validator
router.post(
    '/',
    [
        body('text').isString(),
    ],
    middleware,
    async (req: Request, res: Response) => {

        const { text } = req.body;

        try {
            const result = fuzzySearch(text);
            //console.log(result)
            res.send({ status: 'success', data: result });
        } catch (e) {
            //console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);

export { router as fuzzySearchRouter }