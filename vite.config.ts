/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';


// Load .env file manually
import { fileURLToPath } from 'node:url';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const loadEnv = () => {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      const cleanKey = key.trim();
      const cleanValue = valueParts.join('=').trim();
      if (cleanKey && !cleanKey.startsWith('#')) {
        process.env[cleanKey] = cleanValue;
      }
    });
  }
};
loadEnv();
const localApiPlugin = () => ({
  name: 'local-api',
  configureServer(server: any) {
    // Generic API handler for multiple endpoints
    const handleApiRequest = async (req: any, res: any, modulePath: string) => {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          // Use Vite's ssrLoadModule to properly transpile TypeScript
          const apiModule = await server.ssrLoadModule(modulePath);
          const handler = apiModule.default;

          // Parse query string
          const urlParts = req.url.split('?');
          const queryString = urlParts[1] || '';
          const query: Record<string, string> = {};
          queryString.split('&').forEach((param: string) => {
            const [key, value] = param.split('=');
            if (key) query[key] = decodeURIComponent(value || '');
          });

          const parsedBody = body ? JSON.parse(body) : {};
          const vercelReq: any = {
            method: req.method || 'GET',
            body: parsedBody,
            query,
            headers: req.headers
          };
          const vercelRes: any = {
            setHeader: res.setHeader.bind(res),
            status: (code: number) => {
              res.statusCode = code;
              return vercelRes;
            },
            json: (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
            end: () => res.end()
          };
          await handler(vercelReq, vercelRes);
        } catch (err: any) {
          console.error('❌ Local API error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Local API error',
            details: err?.message,
            stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
          }));
        }
      });
    };

    server.middlewares.use(async (req: any, res: any, next: any) => {
      // Route to appropriate handler
      if (req.url?.startsWith('/api/analyze')) {
        return handleApiRequest(req, res, './api/analyze.ts');
      }
      if (req.url?.startsWith('/api/insights')) {
        return handleApiRequest(req, res, './api/insights.ts');
      }
      if (req.url?.startsWith('/api/reports')) {
        return handleApiRequest(req, res, './api/reports.ts');
      }
      if (req.url?.startsWith('/api/clips')) {
        return handleApiRequest(req, res, './api/clips.ts');
      }
      if (req.url?.startsWith('/api/collections')) {
        return handleApiRequest(req, res, './api/collections.ts');
      }
      return next();
    });
  }
});
export default defineConfig({
  plugins: [
    react(),
    localApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Linkbrain',
        short_name: 'Linkbrain',
        description: 'AI-powered knowledge companion - Save, organize, and discover insights from your content',
        theme_color: '#21DBA4',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'vaul@1.1.2': 'vaul',
      'sonner@2.0.3': 'sonner',
      'recharts@2.15.2': 'recharts',
      'react-resizable-panels@2.1.7': 'react-resizable-panels',
      'react-hook-form@7.55.0': 'react-hook-form',
      'react-day-picker@8.10.1': 'react-day-picker',
      'next-themes@0.4.6': 'next-themes',
      'lucide-react@0.487.0': 'lucide-react',
      'input-otp@1.4.2': 'input-otp',
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'cmdk@1.1.1': 'cmdk',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
      '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
      '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
      '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
      '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
      '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
      '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
      '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
      '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
      '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
      '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
      '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
      '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'build'
  },
  server: {
    port: 3000,
    open: true
  }
});