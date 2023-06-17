import {
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
  mkdirSync,
  statSync,
} from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import { join } from 'path';
import { Parser } from 'xml2js';
import { cacheRootPath } from '../config';

const MAX_RETRY_COUNT = 5;
const RETRY_WAIT_TIME = 500;
const DEFAULT_REQUEST_TIMEOUT = 5000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastModifiedCache: any = undefined;
const cachePath = cacheRootPath + '/lastModifiedCache.json';
function loadLastModifiedCache() {
  if (existsSync(cachePath)) {
    try {
      const rawdata = readFileSync(cachePath, 'utf8');
      lastModifiedCache = JSON.parse(rawdata);
    } catch {
      unlinkSync(cachePath);
      lastModifiedCache = {};
      return;
    }
  } else {
    lastModifiedCache = {};
  }
  setTimeout(saveLastModifiedCache, 1000 * 60 * 60).unref();
}
loadLastModifiedCache();

function saveLastModifiedCache() {
  console.log('保存LastModifiedCache');
  writeFileSync(cachePath, JSON.stringify(lastModifiedCache));
}
[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
  process.on(eventType, saveLastModifiedCache);
});

export type RequestOptions = AxiosRequestConfig;

async function makeRequest(options: RequestOptions, retry = 0) {
  if (retry) await sleep(RETRY_WAIT_TIME);
  try {
    const response = await axios(options);
    const { status, data, headers } = response;
    if (status === 304) {
      console.log(`不需更新:${options.url}`);
      return null;
    } else if (!data) {
      throw new Error(`${options.url}: 返回为空`);
    } else if (data.toString().startsWith('<!DOCTYPE html>')) {
      throw new Error(`${options.url}: 不是有效资源`);
    } else {
      console.log(`访问${options.url}成功`);
      const lastModified = headers['last-modified'];
      if (lastModified) {
        lastModifiedCache[options.url as string] = lastModified;
      }
      return data;
    }
  } catch (err) {
    if (retry >= MAX_RETRY_COUNT) {
      console.log(`访问${options.url}失败`);
      throw new Error(`${options.url}: ${err}`);
    }
    console.log(`${options.url}: ${err}`);
    return makeRequest(options, retry + 1);
  }
}

function createDirIfNonExist(filepath: string) {
  if (!existsSync(filepath)) {
    console.log('该路径不存在，正在创建' + filepath);
    try {
      mkdirSync(filepath, { recursive: true });
    } catch (err) {
      console.log(`创建目录${filepath}失败`, err);
    }
  }
}

// overwrite: If need to overwrite existing file
// cache:     add If-Modified-Since header to bypass unnecessary download based on file modify date.
//            Only meaningful if used with overwrite==true
async function download(
  url: string,
  filepath: string,
  filename: string,
  overwrite = false,
  cache = true,
) {
  if (!lastModifiedCache) loadLastModifiedCache();

  createDirIfNonExist(filepath);
  const exists = existsSync(join(filepath, filename));
  if (!exists || overwrite) {
    try {
      const options: RequestOptions = {
        url,
        timeout: DEFAULT_REQUEST_TIMEOUT,
        responseType: 'arraybuffer',
        httpsAgent: { rejectUnauthorized: false },
      };
      if (exists && cache && url in lastModifiedCache) {
        options.headers = { 'If-Modified-Since': lastModifiedCache[url] };
      }
      const response = await makeRequest(options);
      if (response) {
        writeFileSync(join(filepath, filename), response as any);
      }
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  console.log("不需下载:" + url);
  return readFileSync(join(filepath, filename));
}

async function getJson(url: string, ifmodifiedsince = null) {
  const options: RequestOptions = {
    url,
    headers: {},
    responseType: 'json',
    httpsAgent: { rejectUnauthorized: false },
  };
  if (ifmodifiedsince) {
    options.headers['If-Modified-Since'] = ifmodifiedsince;
  }
  return await makeRequest(options);
}

// Read from json file if exists. Use file modified time for If-Modified-Since header
async function getJsonAndSave(
  url: string,
  filepath: string,
  filename: string,
  timelimit: number,
) {
  if (!lastModifiedCache) loadLastModifiedCache();

  createDirIfNonExist(filepath);
  const filefullpath = join(filepath, filename);
  const fileexists = existsSync(filefullpath);
  const limittimestamp = new Date().getTime() - timelimit;
  let data: any = null;
  let filetimestamp: number;
  if (fileexists) {
    filetimestamp = statSync(filefullpath).mtime.getTime();
    if (limittimestamp < filetimestamp) {
      data = JSON.parse(readFileSync(filefullpath, 'utf8'));
      return data;
    }
  }

  if (fileexists && url in lastModifiedCache) {
    const lastModifiedStamp = Date.parse(lastModifiedCache[url]);
    if (filetimestamp! < lastModifiedStamp) {
      data = await getJson(url);
    } else {
      data = await getJson(url, lastModifiedCache[url]);
    }
    if (!data) {
      data = JSON.parse(readFileSync(filefullpath, 'utf8'));
    }
  } else {
    data = await getJson(url);
  }
  if (data) {
    writeFileSync(filefullpath, JSON.stringify(data));
    return data;
  } else {
    return null;
  }
}

const xmlParser = new Parser();

async function getXml(url: string, ifmodifiedsince = null) {
  const options: RequestOptions = {
    url,
    headers: {},
    responseType: 'text',
    httpsAgent: { rejectUnauthorized: false },
  };
  if (ifmodifiedsince) {
    options.headers['If-Modified-Since'] = ifmodifiedsince;
  }
  const tempxml = await makeRequest(options);
  const tempjson = xmlParser.parseStringPromise(tempxml);
  return tempjson;
}

//Read from xml file if exists. Automatically transform xml format to json format. Use file modified time for If-Modified-Since header

async function getXmlAndSave(
  url: string,
  filepath: string,
  filename: string,
  timelimit: number,
) {
  if (!lastModifiedCache) loadLastModifiedCache();

  createDirIfNonExist(filepath);
  const filefullpath = join(filepath, filename);
  const fileexists = existsSync(filefullpath);
  const limittimestamp = new Date().getTime() - timelimit;
  let data = null;
  let filetimestamp;
  if (fileexists) {
    filetimestamp = statSync(filefullpath).mtime.getTime();
    if (limittimestamp < filetimestamp) {
      data = await xmlParser.parseStringPromise(readFileSync(filefullpath));
      return data;
    }
  }

  if (fileexists && url in lastModifiedCache) {
    const lastModifiedStamp = Date.parse(lastModifiedCache[url]);
    if (limittimestamp > lastModifiedStamp) {
      await download(url, filepath, filename, true);
      data = await xmlParser.parseStringPromise(readFileSync(filefullpath));
    } else {
      await download(url, filepath, filename, false);
      data = await xmlParser.parseStringPromise(readFileSync(filefullpath));
    }
    if (!data) {
      data = await xmlParser.parseStringPromise(readFileSync(filefullpath));
    }
  } else {
    await download(url, filepath, filename, true);
    data = await xmlParser.parseStringPromise(readFileSync(filefullpath));
  }
  if (data) {
    return data;
  } else {
    return null;
  }
}

export {
  makeRequest,
  download,
  getJson,
  getJsonAndSave,
  getXmlAndSave,
  createDirIfNonExist,
  getXml,
};
