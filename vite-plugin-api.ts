import type { Plugin } from 'vite';
import { resolve } from 'path';
import { loadEnv } from 'vite';
import { config } from 'dotenv';

export function apiPlugin(): Plugin {
  return {
    name: 'vite-plugin-api',
    configureServer(server) {
      config({ path: resolve(process.cwd(), '.env') });
      config({ path: resolve(process.cwd(), '.env.local') });

      const env = loadEnv(server.config.mode || 'development', process.cwd(), '');

      Object.keys(env).forEach((key) => {
        if (!(key in process.env) || !process.env[key]) {
          process.env[key] = env[key];
        }
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          const mod = await server.ssrLoadModule('./api/hono-app.ts', {
            fixStacktrace: true,
          });
          const app = mod.app ?? mod.default;

          if (!app || typeof app.fetch !== 'function') {
            next();
            return;
          }

          const bodyText =
            req.method !== 'GET' && req.method !== 'HEAD'
              ? await getBody(req)
              : undefined;

          const request = new Request(
            `http://${req.headers.host}${req.url}`,
            {
              method: req.method || 'GET',
              headers: req.headers as Record<string, string>,
              body: bodyText,
            },
          );

          const response: Response = await app.fetch(request);

          response.headers.forEach((value: string, key: string) => {
            res.setHeader(key, value);
          });

          res.statusCode = response.status;
          const text = await response.text();
          res.end(text);
        } catch (error) {
          console.error('API route error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Internal server error',
              message: error instanceof Error ? error.message : 'Unknown error',
            }),
          );
        }
      });
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}
