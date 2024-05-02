import * as axios from 'axios';

async function callAPIAndCacheResponse(url: string, cacheTime: number = 0): Promise<object> {
  const response = await axios.default.get(url);
  return response.data;
}

//getJson


export { callAPIAndCacheResponse };