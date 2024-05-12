import express from 'express';

import { cardRouterV2 } from '@/routers/v2/card';
import { gachaRouterV2 } from '@/routers/v2/gacha';
import { eventRouterV2 } from '@/routers/v2/event';
import { songRouterV2 } from '@/routers/v2/song';
import { playerRouterV2 } from '@/routers/v2/player';
import { characterRouterV2 } from '@/routers/v2/character';
import { chartRouterV2 } from '@/routers/v2/chart';
import { ycxRouterV2 } from '@/routers/v2/ycx';
import { ycxAllRouterV2 } from '@/routers/v2/ycxAll';
import { lsycxRouterV2 } from '@/routers/v2/lsycx';
import { ycmV2 } from '@/routers/v2/ycm';
import { cardIllustrationRouterV2 } from '@/routers/v2/cardIllustration';
import { gachaSimulateRouterV2 } from '@/routers/v2/gachaSimulate';
import { songMetaRouterV2 } from '@/routers/v2/songMeta';

const router = express.Router();

// v2 routers
router.use('/ycm', ycmV2); // ✅
router.use('/card', cardRouterV2); // ✅
router.use('/cardIllustration', cardIllustrationRouterV2); // ✅
router.use('/gacha', gachaRouterV2); // ✅
router.use('/gachaSimulate', gachaSimulateRouterV2); // ✅
router.use('/event', eventRouterV2); // ✅
router.use('/song', songRouterV2); // ✅
router.use('/songMeta', songMetaRouterV2); // ✅
router.use('/player', playerRouterV2); // ✅
router.use('/character', characterRouterV2); // ✅
router.use('/chart', chartRouterV2); // ✅
router.use('/ycx', ycxRouterV2); // ✅
router.use('/ycxAll', ycxAllRouterV2); // ✅
router.use('/lsycx', lsycxRouterV2) // ✅
// v2 routers end

export { router as V2Router }