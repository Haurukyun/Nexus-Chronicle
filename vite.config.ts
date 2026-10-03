import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'fs';

function devStatePlugin() {
    return {
        name: 'dev-state-sync',
        apply: 'serve' as const,
        configureServer(server: any) {
            server.middlewares.use((req: any, res: any, next: any) => {
                if (req.url === '/__dev_state' && req.method === 'POST') {
                    let body = '';
                    req.on('data', (chunk: any) => { body += chunk; });
                    req.on('end', () => {
                        try {
                            fs.writeFileSync(path.resolve(__dirname, '.dev-state.json'), body, 'utf8');
                            res.statusCode = 200;
                            res.end('ok');
                        } catch (err: any) {
                            res.statusCode = 500;
                            res.end(err.message);
                        }
                    });
                    return;
                }
                next();
            });
        }
    };
}

export default defineConfig({
    server: {
        port: 5173,
        host: true,
    },
    plugins: [react(), devStatePlugin()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        }
    }
});
