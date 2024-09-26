import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import bodyParser from 'body-parser';
import { UserDB, isPartialTsuguUser, isUserPlayerInList, tsuguUser } from '@/database/userDB';
import { Player } from '@/types/Player';
import * as dotenv from 'dotenv';
import { generateVerifyCode } from '@/routers/utils'
import { isServer, isServerList } from '@/types/Server';
import { middleware } from '@/routers/middleware';
import { logger } from '@/logger';
import { serverNameFullList } from '@/config';

dotenv.config();

const router = express.Router();
let userDB: UserDB
if (process.env.LOCAL_DB == 'true') {
    userDB = new UserDB(process.env.MONGODB_URI, process.env.MONGODB_DATABASE_NAME);
    logger('userDB', `已连接至数据库: ${process.env.MONGODB_URI}`
    );
}

router.use(bodyParser.json());

// 查询或创建用户
router.post('/getUserData',
    [
        body('platform').isString(),
        body('userId').isString(),
    ],
    middleware,
    async (req: Request, res: Response) => {
        const { platform, userId } = req.body;

        //检查参数
        try {
            let user = await userDB.getUser(platform, userId);
            if (user == null) {
                user = await userDB.createUser(platform, userId);
            }
            res.json({
                status: 'success',
                data: user
            });
        }
        catch (error) {
            res.status(500).json({ status: 'failed', data: `错误: ${error.message}` });
        }
    }
);

// 修改用户数据
router.post('/changeUserData',
    [
        body('platform').isString(),
        body('userId').isString(),
        body('update').custom(isPartialTsuguUser),
    ],
    middleware,
    async (req: Request, res: Response) => {
        const { platform, userId, update } = req.body;
        //检查参数
        try {
            const updateData = update as Partial<tsuguUser>;
            await userDB.updateUser(platform, userId, updateData);
            res.json({ status: 'success' });
        } catch (error) {
            res.status(500).json({ status: 'failed', data: `错误: ${error.message}` });
        }
    }
);

let verifyCodeCache = {}

// 绑定玩家请求，返回验证码
router.post('/bindPlayerRequest',
    [
        body('platform').isString(),
        body('userId').isString(),
    ],
    middleware,
    async (req: Request, res: Response) => {
        const { platform, userId } = req.body;

        //生成验证码
        const verifyCode = generateVerifyCode()
        verifyCodeCache[`${platform}:${userId}`] = verifyCode

        res.json({ status: 'success', data: { verifyCode } })
    }
);

router.post('/bindPlayerVerification',
    [
        body('platform').isString(),
        body('userId').isString(),
        body('server').custom(isServer),
        body('playerId').isInt(),
        //bindingAction: 'bind' | 'unbind'
        body('bindingAction').isString().custom((value) => value == 'bind' || value == 'unbind'),
    ],
    middleware,
    async (req: Request, res: Response) => {
        const { platform, userId, server, playerId, bindingAction } = req.body;
        const verifyCode = verifyCodeCache[`${platform}:${userId}`]
        //检查验证码是否存在
        if (verifyCode == undefined) {
            res.status(409).json({ status: 'failed', data: '错误: 请先请求验证码' });
            return
        }
        //验证验证码
        const player = new Player(parseInt(playerId), server)
        await player.initFull(false, 3)
        //判断玩家是否存在
        if (player.initError) {
            //删除验证码
            delete verifyCodeCache[`${platform}:${userId}`]
            res.status(422).json({ status: 'failed', data: `错误: 查询玩家时发生错误: ${playerId}` });
            return
        }
        if (!player.isExist) {
            //删除验证码
            delete verifyCodeCache[`${platform}:${userId}`]
            res.status(422).json({ status: 'failed', data: `错误: 该服务器 (${serverNameFullList[server]}) 不存在该玩家ID: ${playerId}` });
            return
        }
        //判断验证码是否正确
        if (player.profile.mainUserDeck.deckName != verifyCode.toString() && player.profile.introduction != verifyCode.toString()) {
            //验证码不正确不删除验证码
            //delete verifyCodeCache[`${platform}:${userId}`]
            const text = `错误: \n评论为: "${player.profile.introduction}", \n卡组名为: "${player.profile.mainUserDeck.deckName}", \n都与验证码不匹配`
            res.status(422).json({ status: 'failed', data: text });
            return
        }
        //验证
        try {
            const userPlayerInList = {
                playerId: playerId,
                server: server,
            }
            //检查是否可以绑定
            const result = await userDB.updateUserPlayerList(platform, userId, bindingAction, userPlayerInList, true)
            delete verifyCodeCache[`${platform}:${userId}`]
            if (result.status == 'failed') {
                res.status(422).json({ status: 'failed', data: `错误: ${result.data}` });
                return
            }
            else {
                res.json(result)
            }
        }
        catch (error) {
            res.status(500).json({ status: 'failed', data: `错误: ${error.message}` });
        }
    }
)

export { router as userRouter }
