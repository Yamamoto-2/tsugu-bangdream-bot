import * as axios from 'axios';

export async function callAPIAndCacheResponse(url: string, cacheTime: number = 0): Promise<object> {
  const response = await axios.default.get(url);
  return response.data;
}
