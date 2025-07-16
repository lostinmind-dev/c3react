import { defineConfig } from 'npm:vite@7.0.4';
import { resolve } from 'node:path';

export function createConfig(opts?: Partial<{ isDev: boolean }>) {
    const c3reactPath = resolve(import.meta.dirname || '', '../lib');

    return defineConfig({
        build: {
            watch: (opts?.isDev === true) ? {} : null,
            minify: (opts?.isDev === true) ? false : 'esbuild',
            sourcemap: (opts?.isDev === true) ? 'inline' : false,
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
        },
        resolve: {
            alias: {
                'c3react/components': resolve(Deno.cwd(), c3reactPath, 'components.ts'),
                'c3react': resolve(Deno.cwd(), c3reactPath, 'core.ts'),

                '@': resolve(Deno.cwd(), 'scripts'),
                '@project': resolve(Deno.cwd(), 'project', 'files'),
            },
        },
    });
}
