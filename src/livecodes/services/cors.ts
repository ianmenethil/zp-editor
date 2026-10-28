import { fetchWithHandler } from '../utils';
import { allowedOrigin, whitelistTarget } from './allowed-origin';

const corsApiUrl = 'https://api.livecodes.io/cors?url=';
const selfHostedUrl = './api/cors?url=';
const proxyUrl = 'https://api.allorigins.win/raw?url=';

export const corsService = {
  fetch: async (url: string, options?: RequestInit) => {
    if (process.env.SELF_HOSTED === 'true') {
      // self-hosted deploys have no backend — the relative proxy does not exist
      return fetchWithHandler(url, options);
    }
    const corsUrl =
      (allowedOrigin() ? corsApiUrl : proxyUrl) + encodeURIComponent(url);
    if (whitelistTarget(url)) {
      return fetchWithHandler(corsUrl, options);
    }
    return fetchWithHandler(url, options).catch(() => fetchWithHandler(corsUrl, options));
  },
};
