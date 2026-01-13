/**
 * Express middleware for request/response logging
 * Migrated from backend_old/src/routers/middleware.ts
 */

import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const requestTime = Date.now();
    const timeString = new Date(requestTime).toString().split(' ')[4];

    // Log incoming request
    console.log(`[${timeString}] [Request] ${req.ip} ${req.baseUrl}${req.path}`, req.body);

    // Save original send method
    const originalSend = res.send;

    let isLogged = false;

    // Override send method to log response
    res.send = function (body?: any) {
        if (!isLogged) {
            isLogged = true;
            const responseTime = Date.now();
            const duration = responseTime - requestTime;
            // Size of response in MB
            const size = Buffer.byteLength(JSON.stringify(body)) / 1024 / 1024;
            console.log(`[${timeString}] [Response] ${req.ip} ${req.baseUrl}${req.path} ${size.toFixed(2)}MB ${duration}ms`);
        }
        // Call original send method
        return originalSend.call(this, body);
    };

    next();
};
