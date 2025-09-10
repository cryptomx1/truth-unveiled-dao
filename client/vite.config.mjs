import { defineConfig } from 'vite';
import path from 'path';
export default defineConfig(async () => {
    const react = (await import('@vitejs/plugin-react')).default;
    const tsconfigPaths = (await import('vite-tsconfig-paths')).default;
    return {
        plugins: [react(), tsconfigPaths()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@shared': path.resolve(__dirname, './src/shared'),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes('node_modules'))
                            return 'vendor';
                    },
                },
            },
            chunkSizeWarningLimit: 1000,
            minify: 'esbuild',
            target: 'esnext',
        },
        server: {
            port: 5173,
            open: true,
        },
        esbuild: {
            logOverride: { 'this-is-undefined-in-esm': 'silent' },
        },
    };
});
