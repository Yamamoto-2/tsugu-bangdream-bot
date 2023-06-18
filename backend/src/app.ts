import express from 'express';
import { gachaSimulateRouter } from './routers/gachaSimulate';
import { cardIllustrationRouter } from './routers/getCardIllustration';
import { roomListRouter } from './routers/roomList';
import { searchCardRouter } from './routers/searchCard';
import { searchCharacterRouter } from './routers/searchCharacter';
import { searchEventRouter } from './routers/searchEvent';
import { searchGachaRouter } from './routers/searchGacha';
import { searchPlayerRouter } from './routers/searchPlayer';
import { searchSongRouter } from './routers/searchSong';
import { songMetaRouter } from './routers/songMeta';
import { ycxRouter } from './routers/ycx';
import { ycxAllRouter } from './routers/ycxAll';

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
app.use('/ycx', ycxRouter);
app.use('/ycxAll', ycxAllRouter);

//404
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});


app.listen(3000, () => {
    console.log('listening on port 3000');
}
);

