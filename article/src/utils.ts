import fs from 'fs';
import path from 'path';

export function base64ToFile(base64List: Array<{ type: 'string' | 'base64', string: string }>, outputPath: string) {
    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    }

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
                fs.writeFileSync(`${outputPath}${imageId}.png`, dataBuffer);
                console.log(`${outputPath}${imageId}.png 保存成功！`);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
}