/**
 * Backend application entry point
 * Express app that serves Tsugu Schema APIs
 */

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { BACKEND_PORT } from './config/runtime';
import { logger } from './lib/logger';
import { requestLogger } from './lib/middleware';
import { eventRouter } from './routes/event';
import { songRouter } from './routes/song';

dotenv.config();

const app = express();

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Request/response logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: 'v5' });
});

// V5 routes (return Tsugu Schema)
app.use(eventRouter);
app.use(songRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ status: 'failed', data: '404 Not Found' });
});

const port = BACKEND_PORT;

app.listen(port, () => {
    logger('expressMainThread', `listening on port ${port}`);
});


