import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';

const errUrl: string[] = [];

export async function download(url: string, directory?: string, fileName?: string, cacheTime = 0): Promise<Buffer> {
  if (directory != undefined && fileName != undefined) {
    createDirIfNonExist(directory);
  }
  try {
    if (errUrl.includes(url)) {
      throw new Error("downloadFile: errUrl.includes(url)");
    }

    let eTag: string | undefined;
    const cacheFilePath = path.join(directory || '', `${fileName || ''}`);
    if (fileName && directory) {
      const eTagFilePath = path.join(directory, `${fileName}.etag`);
      eTag = fs.existsSync(eTagFilePath) ? fs.readFileSync(eTagFilePath, 'utf-8') : undefined;
      if (fs.existsSync(cacheFilePath)) {
        const stat = fs.statSync(cacheFilePath);
        const now = Date.now();
        if (now - stat.mtimeMs < cacheTime * 1000) {
          //console.log(`Cache time for "${url}" has not expired. Using cached file.`);
          const cachedData = fs.readFileSync(cacheFilePath);
          return cachedData;
        }
      }
    }
    const headers = eTag ? { 'If-None-Match': eTag } : {};
    let response;
    try {
      response = await axios.get(url, { headers, responseType: 'arraybuffer' });
    } catch (error) {
      if (error.response && error.response.status === 304) {
        //console.log(`ETag matches for "${url}". Using cached file.`);
        const cachedData = fs.readFileSync(cacheFilePath);
        return cachedData;
      } else {
        throw error;
      }
    }

    const fileBuffer = Buffer.from(response.data, 'binary');

    const newETag = response.headers.etag;
    if (newETag && directory && fileName) {
      fs.writeFileSync(path.join(directory, `${fileName}.etag`), newETag);
    }

    if (directory && fileName) {
      fs.writeFileSync(path.join(directory, fileName), fileBuffer);
    }
    //console.log(`Downloaded file from "${url}"`);
    return fileBuffer;
  } catch (e) {
    errUrl.push(url);
    if (url.includes('.png')) {
      throw e;
    } else {
      throw new Error(`Failed to download file from "${url}". Error: ${e.message}`);
    }
  }
}

function createDirIfNonExist(filepath: string) {
  if (!fs.existsSync(filepath)) {
    //console.log('creating ' + filepath);
    try {
      fs.mkdirSync(filepath, { recursive: true });
    } catch (err) {
      //console.log(`creating ${filepath} failed`, err);
    }
  }
}

export async function getJsonAndSave(url: string, directory?: string, fileName?: string, cacheTime = 0): Promise<object> {
  try {
    if (directory != undefined && fileName != undefined) {
      createDirIfNonExist(directory);
    }
    let eTag: string | undefined;
    const cacheFilePath = path.join(directory || '', `${fileName || ''}`);
    if (fileName && directory) {
      const eTagFilePath = path.join(directory, `${fileName}.etag`);
      eTag = fs.existsSync(eTagFilePath) ? fs.readFileSync(eTagFilePath, 'utf-8') : undefined;
      if (fs.existsSync(cacheFilePath)) {
        const stat = fs.statSync(cacheFilePath);
        const now = Date.now();
        if (now - stat.mtimeMs < cacheTime * 1000) {
          //console.log(`Cache time for "${url}" has not expired. Using cached JSON data.`);
          const cachedData = fs.readFileSync(cacheFilePath, 'utf-8');
          const cachedJson = JSON.parse(cachedData);
          return cachedJson;
        }
      }
    }
    const headers = eTag ? { 'If-None-Match': eTag } : {};
    let response;
    try {
      response = await axios.get(url, { headers, responseType: 'arraybuffer' });
    } catch (error) {
      if (error.response && error.response.status === 304) {
        //console.log(`ETag matches for "${url}". Using cached JSON data.`);
        const cachedData = fs.readFileSync(cacheFilePath, 'utf-8');
        const cachedJson = JSON.parse(cachedData);
        return cachedJson;
      } else {
        throw error;
      }
    }

    const fileBuffer = Buffer.from(response.data, 'binary');
    const fileContent = fileBuffer.toString('utf-8');
    const jsonObject = JSON.parse(fileContent);

    const newETag = response.headers.etag;
    if (newETag && directory && fileName) {
      fs.writeFileSync(path.join(directory, `${fileName}.etag`), newETag);
    }

    if (directory && fileName) {
      fs.writeFileSync(path.join(directory, fileName), fileContent);
    }

    //console.log(`Downloaded JSON data from "${url}"`);
    return jsonObject;
  } catch (e) {
    throw new Error(`Failed to download JSON data from "${url}". Error: ${e.message}`);
  }
}