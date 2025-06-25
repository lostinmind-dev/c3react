import { defineConfig } from 'npm:vite';
import { resolve } from 'node:path';

export function createConfig(watch?: true) {
    const c3reactPath = resolve(import.meta.dirname || '', '../../mod.ts');

    return defineConfig({
        build: {
            watch: watch ? {} : null,
            rollupOptions: {
                // Один главный файл, который импортирует все остальные
                input: resolve(Deno.cwd(), 'scripts/main.ts'),
                output: {
                    dir: 'project/scripts',
                    format: 'esm',
                    entryFileNames: 'main.js',
                },
                treeshake: 'recommended',
            },
            outDir: 'project/scripts',
            emptyOutDir: false,
            sourcemap: (watch) ? 'inline' : false,
            target: 'es2022',
        },
        resolve: {
            alias: {
                'c3react': resolve(Deno.cwd(), c3reactPath),
                '@': resolve(Deno.cwd(), 'scripts'),
            },
        },
    });
}
