import { defineConfig } from 'npm:vite@7.0.4';
import { resolve } from 'node:path';

export function createConfig(prod?: true) {
    const c3reactPath = resolve(import.meta.dirname || '', '../lib/core.ts');

    return defineConfig({
        build: {
            watch: (prod) ? {} : null,
            minify: (prod) ? 'esbuild' : false,
            sourcemap: (prod) ? 'inline' : false,
            emptyOutDir: false,
            outDir: 'project/scripts',
            target: 'es2022',
            rollupOptions: {
                // Один главный файл, который импортирует все остальные
                input: resolve(Deno.cwd(), 'scripts', 'main.ts'),
                output: {
                    dir: 'project/scripts',
                    format: 'esm',
                    entryFileNames: 'main.js',
                },
                treeshake: true,
            },
            // terserOptions: (prod) ? {
            //     compress: {
            //         drop_console: true,
            //         drop_debugger: true,
            //     },
            //     format: {
            //         comments: false,
            //     },
            // } : undefined,
        },
        resolve: {
            alias: {
                'c3react': resolve(Deno.cwd(), c3reactPath),
                '@': resolve(Deno.cwd(), 'scripts'),
                '@project': resolve(Deno.cwd(), 'project', 'files'),
            },
        },
    });
}
