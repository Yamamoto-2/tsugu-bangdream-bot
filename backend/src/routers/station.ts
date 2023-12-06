import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import { UserDB } from '@/database/userDB';
import { Room, submitRoomNumber, queryAllRoom } from '@/types/Room';
import * as dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
let userDB: UserDB
if (process.env.LOCAL_DB == 'true') {
    userDB = new UserDB(process.env.MONGODB_URI, process.env.MONGODB_DATABASE_NAME);
    console.log(`station: 已连接至数据库: ${process.env.MONGODB_URI}`);
}
router.use(bodyParser.json());

router.post('/submitRoomNumber',
    [
        body('number').isInt(),
        body('rawMessage').isString(),
        body('platform').isString(),
        body('user_id').isString(),
        body('userName').isString(),
        body('time').isInt(),
        body('bandoriStationToken').isString().optional(),
    ],
    async (req: Request, res: Response) => {
        console.log(req.url, req.body);
        const { number, rawMessage, platform, user_id, userName, time, bandoriStationToken } = req.body;
        const user = await userDB.getUser(platform, user_id);
        try {
            await submitRoomNumber({
                number: number,
                rawMessage: rawMessage,
                source: platform,
                userId: user_id,
                time: time,
                userName: userName,
                bandoriStationToken
            }, user)
            res.status(200).json({
                status: 'success',
                data: '提交成功'
            });
        }
        catch (e) {
            res.status(400).json({ status: 'failed', data: `错误: ${e.message}` });
        }

    }
);

router.get('/queryAllRoom',
    async (req: Request, res: Response) => {
        console.log(req.url);
        try {
            let roomList = await queryAllRoom()
            res.status(200).json({
                status: 'success',
                data: roomList
            });
        }
        catch (e) {
            res.status(400).json({ status: 'failed', data: `错误: ${e.message}` });
        }

    }
);


export { router as stationRouter }