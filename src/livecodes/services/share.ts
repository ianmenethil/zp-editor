import type { Config } from '../models';
import { allowedOrigin } from './allowed-origin';

const dpasteGetUrl = 'https://dpaste.com/';
const dpastePostUrl = 'https://dpaste.com/api/v2/';
const apiUrl = 'https://api2.livecodes.io/share';
const selfHostedUrl = './api/share';

// note: dpaste id length: 9, api id length: 11, self-hosted id length: 14

type ConfigWithResult = Partial<Config & { result: string }>;
interface ShareService {
  getProject: (id: string) => Promise<ConfigWithResult>;
  shareProject: (config: ConfigWithResult) => Promise<string>;
}

const dpasteService = {
  getProject: async (id: string): Promise<ConfigWithResult> => {
    // dpaste ids are 9 chars; forward longer ids to the service that owns them
    if (id.length >= 11) return apiService.getProject(id);
    try {
      const res = await fetch(dpasteGetUrl + id + '.txt');
      if (!res.ok) return {};
      return JSON.parse(await res.text());
    } catch {
      return {};
    }
  },
  shareProject: async (config: ConfigWithResult): Promise<string> => {
    const res = await fetch(dpastePostUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `content=${encodeURIComponent(JSON.stringify(config))}&title=${encodeURIComponent(
        config.title || '',
      )}&syntax=json&expiry_days=365`,
    });
    if (!res.ok) throw new Error('Failed to share project');
    const url = await res.text();
    return url.replace(dpasteGetUrl, '');
  },
};

const apiService = {
  getProject: async (id: string): Promise<ConfigWithResult> => {
    // for backward compatibility
    if (id.length < 11) return dpasteService.getProject(id);
    if (id.length >= 14) return selfHostedService.getProject(id);
    try {
      const res = await fetch(apiUrl + '?id=' + id);
      if (!res.ok) return {};
      return JSON.parse(await res.text());
    } catch {
      return {};
    }
  },
  shareProject: async (config: ConfigWithResult): Promise<string> => {
    if (!allowedOrigin()) throw new Error('Share service unavailable');
    const res = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to share project');
    return res.text();
  },
};

const selfHostedService = {
  getProject: async (id: string): Promise<ConfigWithResult> => {
    // allow getting projects shared from api service on hosted app
    if (id.length < 14) return apiService.getProject(id);
    try {
      const res = await fetch(selfHostedUrl + '?id=' + id);
      if (!res.ok) return {};
      return res.json();
    } catch {
      return {};
    }
  },
  shareProject: async (config: ConfigWithResult): Promise<string> => {
    const res = await fetch(selfHostedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to share project');
    return res.text();
  },
};

export const shareService: ShareService =
  process.env.SELF_HOSTED === 'true'
    ? process.env.SELF_HOSTED_SHARE === 'true'
      ? selfHostedService
      : dpasteService
    : allowedOrigin()
      ? apiService
      : dpasteService;
