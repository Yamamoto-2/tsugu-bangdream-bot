import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const middleware = (req: Request, res: Response, next: NextFunction) => {
    const requestTime = Date.now();
    const timeString = new Date(requestTime).toString().split(' ')[4];
    // yyyy-MM-ddTHH:mm:ss
    console.log(`[${timeString}] [Request] ${req.ip} ${req.baseUrl}${req.path}`, req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`[${timeString}] [Validation Failed] ${req.ip} ${req.baseUrl}${req.path}`, errors.array());
        return res.status(400).send({ status: 'failed', data: `参数错误`, error: errors.array() });
    }

    // 保存原始的 send 方法
    const originalSend = res.send;

    let isLogged = false;// 用于记录是否已经发送响应

    // 重写 send 方法
    res.send = function (body?: any) {
        if (!isLogged) {
            isLogged = true;
            const responseTime = Date.now();
            const duration = responseTime - requestTime;
            //size of response MB
            const size = Buffer.byteLength(JSON.stringify(body)) / 1024 / 1024;
            console.log(`[${timeString}] [Response] ${req.ip} ${req.baseUrl}${req.path} ${size.toFixed(2)}MB ${duration}ms`);
        }
        // 调用原始的 send 方法，确保响应正常发送
        return originalSend.call(this, body);
    };

    next();
};
