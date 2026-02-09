import type { Plugin } from 'vite';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { loadEnv } from 'vite';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function apiPlugin(): Plugin {
  return {
    name: 'vite-plugin-api',
    configureServer(server) {
      // Load environment variables from .env files using dotenv
      config({ path: resolve(process.cwd(), '.env') });
      config({ path: resolve(process.cwd(), '.env.local') });
      
      // Also load via Vite's loadEnv (includes VITE_ prefixed vars)
      const env = loadEnv(server.config.mode || 'development', process.cwd(), '');
      
      // Set environment variables for API routes (prioritize existing, then dotenv, then Vite)
      Object.keys(env).forEach((key) => {
        if (!(key in process.env) || !process.env[key]) {
          process.env[key] = env[key];
        }
      });

      server.middlewares.use(async (req, res, next) => {
        // Only handle /api/* routes
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          // Remove /api prefix and get the route path
          // Handle nested routes like /api/webhooks/stripe
          const routePath = req.url.replace('/api/', '').split('?')[0]; // Remove query string
          
          // Use relative path from project root for ssrLoadModule
          const routeFileRelative = `./api/${routePath}.ts`;
          const routeFile = resolve(__dirname, 'api', `${routePath}.ts`);

          // Check if file exists
          if (!existsSync(routeFile)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: 'Not found',
              message: `API route not found: /api/${routePath}`
            }));
            return;
          }

          // Use Vite's ssrLoadModule to load TypeScript files
          // This handles TypeScript compilation and module resolution
          // Use relative path format that Vite expects
          const routeModule = await server.ssrLoadModule(routeFileRelative, {
            fixStacktrace: true,
          });
          const handler = routeModule.default;

          if (typeof handler === 'function') {
            // Get request body
            const bodyText = req.method !== 'GET' && req.method !== 'HEAD' 
              ? await getBody(req)
              : undefined;

            // Create a Request-like object from the incoming request
            const request = new Request(
              `http://${req.headers.host}${req.url}`,
              {
                method: req.method || 'GET',
                headers: req.headers as Record<string, string>,
                body: bodyText,
              }
            );

            const response = await handler(request);
            
            // Set response headers
            response.headers.forEach((value: string, key: string) => {
              res.setHeader(key, value);
            });
            
            res.statusCode = response.status;
            const text = await response.text();
            res.end(text);
          } else {
            next();
          }
        } catch (error) {
          console.error('API route error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }));
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
