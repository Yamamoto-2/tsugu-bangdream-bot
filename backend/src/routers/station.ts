import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import bodyParser from 'body-parser';
import { UserDB, getUserPlayerByUser, userPlayerInList } from '@/database/userDB';
import { submitRoomNumber, queryAllRoom } from '@/types/Room';
import { logger } from '@/logger';
import { getUserIcon } from "@/api/userIcon"
import { middleware } from '@/routers/middleware';
import * as dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
let userDB: UserDB
if (process.env.LOCAL_DB == 'true') {
    userDB = new UserDB(process.env.MONGODB_URI, process.env.MONGODB_DATABASE_NAME);
    logger('station', `已连接至数据库: ${process.env.MONGODB_URI}`);
}
router.use(bodyParser.json());

router.post('/submitRoomNumber',
    [
        body('number').isInt(),
        body('rawMessage').isString(),
        body('platform').isString(),
        body('userId').isString(),
        body('userName').isString(),
        body('time').isInt(),
        body('avatarUrl').isString().optional(),
        body('bandoriStationToken').isString().optional(),
    ],
    middleware,
    async (req: Request, res: Response) => {
        const { number, rawMessage, platform, userId, userName, time, avatarUrl, bandoriStationToken } = req.body;
        const user = await userDB.getUser(platform, userId);
        let userPlayerInList: userPlayerInList
        try {
            userPlayerInList = getUserPlayerByUser(user)
        }
        catch (e) {
            //logger('station', `error: ${e.message}`)
        }
        try {
            await submitRoomNumber({
                number: number,
                rawMessage: rawMessage,
                source: platform,
                userId: userId,
                time: time,
                userName: userName,
                avatarUrl: avatarUrl,
                bandoriStationToken
            },
                userPlayerInList
            )
            if(avatarUrl){
                getUserIcon(avatarUrl)
            }
            res.status(200).json({
                status: 'success',
                data: '提交成功'
            });
        }
        catch (e) {
            res.status(500).json({ status: 'failed', data: `错误: ${e.message}` });
        }

    }
);

router.get('/queryAllRoom',
    middleware,
    async (req: Request, res: Response) => {
        try {
            let roomList = await queryAllRoom()
            res.status(200).json({
                status: 'success',
                data: roomList
            });
        }
        catch (e) {
            res.status(500).json({ status: 'failed', data: `错误: ${e.message}` });
        }

    }
);


export { router as stationRouter }