import express from 'express';
import { body, validationResult } from 'express-validator';
import { Room, queryAllRoom } from '@/types/Room';
import { drawRoomList } from '@/view/roomList';
import { generateVerifyCode, isInteger, isServer, isServerList, listToBase64 } from '@/routers/utils';
import { Server,getServerByName } from "@/types/Server";

const router = express.Router();



router.post('/', [
    body('text').isString(),
  ], async (req, res) => {
    console.log(req.ip, `${req.baseUrl}${req.path}`, JSON.stringify(req.body));
  
    // 验证请求体
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send([{ type: 'string', string: '参数错误' }]);
    }
  
    const { text } = req.body; // 默认不压缩
  
    try {
        const serversArray = text.split(" "); // 将字符串转换为数组

        const servers = serversArray.map(s => getServerByName(s))
        console.log(servers)
        // 去除 undefined
        for (let i = 0; i < servers.length; i++) {
            if (servers[i] == undefined) {
                servers.splice(i, 1);
                i--;
            }
        }
      
      res.send({ servers: servers}); // 发送转换后的结果
    } catch (e) {
      console.error(e);
      res.status(500).send([{ type: 'string', string: '内部错误' }]);
    }
  });
  


export { router as utilsRouterV2 }