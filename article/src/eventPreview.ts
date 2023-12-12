import * as axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const url = 'http://localhost:3000';

function base64ToFile(base64List: Array<{ type: 'string' | 'base64', string: string }>, path: string) {
    let imageId = 0;
    for (let i = 0; i < base64List.length; i++) {
        const element = base64List[i];
        if (element.type == 'string') {
            continue;
        }
        else if (element.type == 'base64') {
            const base64 = element.string;
            const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
            const dataBuffer = Buffer.from(base64Data, 'base64');
            imageId++;
            try {
                fs.writeFileSync(`${path}${imageId}.png`, dataBuffer);
                console.log(`${path}${imageId}.png 保存成功！`);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
}

async function processRequest(postPromise, filePath) {
    try {
        const response = await postPromise;
        base64ToFile(response.data, filePath);
    } catch (error) {
        console.error(error);
    }
}

async function main(eventIdString: string) {
    const eventId = parseInt(eventIdString);
    const projectRoot: string = path.resolve(path.dirname(__dirname));
    const outputPath = `${projectRoot}/output/eventPreview/${eventId}`
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    const promises = [
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewBanner', { eventId }), `${outputPath}/0_eventPreviewBanner_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewTitle', { eventId }), `${outputPath}/1_eventPreviewTitle_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewRules', { eventId }), `${outputPath}/2_eventPreviewRules_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewSongs', { eventId }), `${outputPath}/3_eventPreviewSongs_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewCards', { eventId }), `${outputPath}/4_eventPreviewCards_`),
        processRequest(axios.default.post(url + '/eventPreview/eventPreviewGacha', { eventId }), `${outputPath}/5_eventPreviewGacha_`)
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
