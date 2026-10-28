import { proxyConsole } from '../result/utils';
import { getAppCDN } from '../services/modules';
import { createWorkerFromContent } from '../utils/utils';
import type { InitMessage } from './models';

proxyConsole();

// window extensions used by the compiler page — typed instead of `any`
type CompilerWindow = Window & {
  initCompiler?: (message: InitMessage) => Promise<void>;
  compilers?: Record<string, (code: string, options: unknown) => Promise<string>>;
};
const compilerWindow = window as unknown as CompilerWindow;

compilerWindow.initCompiler = async (message: InitMessage) => {
  const baseUrl = message.baseUrl;
  const workerUrl = baseUrl + '{{hash:compile.worker.js}}';
  const origin = new URL(baseUrl).origin;
  const content = `self.appCDN='${getAppCDN()}';importScripts('${workerUrl}');`;
  const worker = createWorkerFromContent(content);

  await new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = baseUrl + '{{hash:compile.page.js}}';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  worker.addEventListener('message', async function (ev) {
    if (
      ev.data.payload &&
      compilerWindow.compilers &&
      compilerWindow.compilers[ev.data.payload.language]
    ) {
      ev.data.payload.compiled = await compilerWindow.compilers[ev.data.payload.language](
        ev.data.payload.compiled,
        {
          config: ev.data.payload.config,
          language: ev.data.payload.language,
          baseUrl,
          options: ev.data.payload.options,
          worker,
        },
      );
    }
    if (ev.data.trigger === 'compileInCompiler') {
      worker.postMessage({ ...ev.data, from: 'compiler' });
    } else {
      parent.postMessage({ ...ev.data, from: 'compiler' }, origin);
    }
  });

  window.addEventListener('message', async function (event) {
    // do not let comlink release codemirror-ts worker prematurely
    if (event.data.type === 'RELEASE') return;
    worker.postMessage(event.data);
  });

  worker.postMessage(message);
};
