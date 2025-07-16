import { join, resolve } from 'node:path';
import { 
    type BuildEnvironmentOptions, 
    type AliasOptions, 
    type UserConfig,
    defineConfig,
} from 'npm:vite@7.0.4';

export interface IC3ReactConfig {
    dev: UserConfig,
    build: UserConfig,
}

export interface IConfig {
    /** @default './project' */
    projectRoot?: `./${string}`;
    /** @default './scripts' */
    scriptsRoot?: `./${string}`;

    dev?: BuildEnvironmentOptions;

    build?: BuildEnvironmentOptions;

    alias?: AliasOptions;
}

export function createC3ReactConfig(config: IConfig): IC3ReactConfig {
    const { projectRoot, scriptsRoot, dev, build, alias } = config;

    const PROJECT_ROOT = projectRoot || './project';
    const SCRIPTS_ROOT = scriptsRoot || './scripts';

    const enviromentOpts: BuildEnvironmentOptions = {
        emptyOutDir: false,
        
        outDir: `${PROJECT_ROOT}/scripts`,

        rollupOptions: {
            input: `${SCRIPTS_ROOT}/main.ts`,
            output: {
                // dir: `${PROJECT_ROOT}/scripts`,
                format: 'esm',
                entryFileNames: 'main.js'
            },
            treeshake: true,
        },
    }

    const c3reactPath = resolve(import.meta.dirname || '', '../lib');
    const aliasOpts = {
        'c3react/components': resolve(Deno.cwd(), c3reactPath, 'components.ts'),
        'c3react': resolve(Deno.cwd(), c3reactPath, 'core.ts'),

        '@': resolve(Deno.cwd(), 'scripts'),
        '@project': resolve(Deno.cwd(), 'project', 'files'),

        ...alias,
    };

    const devConfig = defineConfig({
        build: {
            ...enviromentOpts,
            ...dev,

            watch: {},
        },
        resolve: {
            alias: aliasOpts
        }
    });

    const buildConfig = defineConfig({
        build: {
            ...enviromentOpts,
            ...build,

            watch: null,
        },
        resolve: {
            alias: aliasOpts,
        }
    });

    return {
        dev: devConfig,
        build: buildConfig,
    };
}