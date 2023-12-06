import { downloadFile } from '@/api/downloadFile'

const cache: { [url: string]: Buffer } = {};

async function downloadFileCache(url: string,IgnoreErr = true): Promise<Buffer> {
    if (cache[url]) {
        // 如果已经有缓存，则直接返回缓存数据
        //console.log(`已有缓存:${url}`)
        return cache[url];
    }
    // 下载文件
    const data = await downloadFile(url,IgnoreErr)
    // 将下载的文件缓存起来
    cache[url] = data;
    return data;
}

export { downloadFileCache }
