import express from 'express';
import { gachaSimulateRouter } from '@/routers/gachaSimulate';
import { cardIllustrationRouter } from '@/routers/getCardIllustration';
import { roomListRouter } from '@/routers/roomList';
import { searchCardRouter } from '@/routers/searchCard';
import { searchCharacterRouter } from '@/routers/searchCharacter';
import { searchEventRouter } from '@/routers/searchEvent';
import { searchGachaRouter } from '@/routers/searchGacha';
import { searchPlayerRouter } from '@/routers/searchPlayer';
import { searchSongRouter } from '@/routers/searchSong';
import { songMetaRouter } from '@/routers/songMeta';
import { ycxRouter } from '@/routers/ycx';
import { ycxAllRouter } from '@/routers/ycxAll';
import { lsycxRouter } from '@/routers/lsycx';
import { songChartRouter } from '@/routers/songChart';1
import { userRouter } from '@/routers/user'
import { stationRouter } from '@/routers/station'
import { eventPreviewRouter } from '@/routers/article/eventPreview'
import { eventReportRouter } from '@/routers/article/eventReport'
import * as dotenv from 'dotenv';
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
// import { userRouterV2 } from '@/routers/v2/user';
// import { stationRouterV2 } from '@/routers/v2/station';


dotenv.config();


const app = express();

app.use(express.json());

app.use('/gachaSimulate', gachaSimulateRouter);
app.use('/getCardIllustration', cardIllustrationRouter);
app.use('/roomList', roomListRouter);
app.use('/searchCard', searchCardRouter);
app.use('/searchCharacter', searchCharacterRouter);
app.use('/searchEvent', searchEventRouter);
app.use('/searchGacha', searchGachaRouter);
app.use('/searchPlayer', searchPlayerRouter);
app.use('/searchSong', searchSongRouter);
app.use('/songMeta', songMetaRouter);
app.use('/songChart', songChartRouter);
app.use('/ycx', ycxRouter);
app.use('/ycxAll', ycxAllRouter);
app.use('/lsycx', lsycxRouter)

if (process.env.LOCAL_DB == 'true') {
    app.use('/user', userRouter);
    app.use('/station', stationRouter);
}
else {
    app.use('/user', (req, res) => {
        console.log(req.url, req.body);
        res.status(404).send({
            status: 'fail',
            data: '错误: 服务器未启用数据库'
        });
    });
    app.use('/station', (req, res) => {
        console.log(req.url, req.body);
        res.status(404).send({
            status: 'fail',
            data: '错误: 服务器未启用数据库'
        });
    });
}
if (process.env.ARTICLE == 'true') {
    app.use('/eventPreview', eventPreviewRouter);
    app.use('/eventReport', eventReportRouter);
}

// v2 routers
app.use('/v2/ycm', ycmV2); // ✅
app.use('/v2/card', cardRouterV2); // ✅
app.use('/v2/cardIllustration', cardIllustrationRouterV2); // ✅
app.use('/v2/cacha', gachaRouterV2); // ✅
app.use('/v2/gachaSimulate', gachaSimulateRouterV2); // ✅
app.use('/v2/event', eventRouterV2); // ✅
app.use('/v2/song', songRouterV2); // ✅
app.use('/v2/songMeta', songMetaRouterV2); // ✅
app.use('/v2/player', playerRouterV2); // ✅
app.use('/v2/character', characterRouterV2); // ✅
app.use('/v2/chart', chartRouterV2); // ✅
app.use('/v2/ycx', ycxRouterV2); // ✅
app.use('/v2/ycxAll', ycxAllRouterV2); // ✅
app.use('/v2/lsycx', lsycxRouterV2) // ✅
// v2 routers end

//404
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});


app.listen(3000, () => {
    console.log('listening on port 3000');
}
);