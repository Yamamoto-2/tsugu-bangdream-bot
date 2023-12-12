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
            }
            catch (err) {
                console.log(err);
            }
            console.log(`${path}${imageId}.png 保存成功！`);
        }
    }
}

async function main(eventIdString: string) {
    const eventId = parseInt(eventIdString);
    // Create an array of promises for the POST requests
    const promises = [
        axios.default.post(url + '/eventPreview/eventPreviewBanner', { eventId }),
        axios.default.post(url + '/eventPreview/eventPreviewTitle', { eventId }),
        axios.default.post(url + '/eventPreview/eventPreviewRules', { eventId }),
        axios.default.post(url + '/eventPreview/eventPreviewCards', { eventId }),
        axios.default.post(url + '/eventPreview/eventPreviewSongs', { eventId }),
        axios.default.post(url + '/eventPreview/eventPreviewGacha', { eventId })
    ];

    // Use Promise.all to wait for all requests to complete
    const responses = await Promise.all(promises);
    const projectRoot: string = path.resolve(path.dirname(__dirname));
    const outputPath = `${projectRoot}/output/eventPreview/${eventId}`
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
    // Process each response
    base64ToFile(responses[0].data, `${outputPath}/0_eventPreviewBanner_`);
    base64ToFile(responses[1].data, `${outputPath}/1_eventPreviewTitle_`);
    base64ToFile(responses[2].data, `${outputPath}/2_eventPreviewRules_`);
    base64ToFile(responses[3].data, `${outputPath}/3_eventPreviewCards_`);
    base64ToFile(responses[4].data, `${outputPath}/4_eventPreviewSongs_`);
    base64ToFile(responses[5].data, `${outputPath}/5_eventPreviewGacha_`);
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
