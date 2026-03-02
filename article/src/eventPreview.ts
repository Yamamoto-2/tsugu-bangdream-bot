import * as axios from 'axios';
import * as path from 'path';
import * as readline from 'readline';
import { processRequest } from './utils';

const url = 'http://tsugubot.com:8080';
const projectRoot: string = path.resolve(path.dirname(__dirname));


async function main(eventIdString: string) {
    const eventId = parseInt(eventIdString);
    const outputDir = `${projectRoot}/output/eventPreview/${eventId}`

    const promises = [
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewTitle', { eventId }), `${outputDir}/0_eventPreviewTitle_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewDetail', { eventId }), `${outputDir}/1_eventPreviewDetail_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewRules', { eventId }), `${outputDir}/2_eventPreviewRules_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewSongs', { eventId }), `${outputDir}/3_eventPreviewSongs_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewCards', { eventId }), `${outputDir}/4_eventPreviewCards_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewGacha', { eventId }), `${outputDir}/5_eventPreviewGacha_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewCards', { eventId, illustration: true }), `${outputDir}/6_eventPreviewCardIllustration_`)
    ];

    // Wait for all requests to complete
    await Promise.allSettled(promises);
}

// Read eventId from command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('请输入活动ID：', (answer) => {
    main(answer);
    rl.close();
});
