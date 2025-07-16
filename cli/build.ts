import { type IConfig, createC3ReactConfig } from './config.ts';
import { createBuilder } from 'npm:vite@7.0.4';
import { createConfig } from './vite-config.ts';
import { join } from 'node:path';



async function findConfig() {
    const module = await import(`file://${join(Deno.cwd(), 'c3react.config.ts')}`)
    let config: IConfig | null = null;

    if ('default' in module) {
        config = module.default as IConfig;
    }

    return (config) ? createC3ReactConfig(config) : createC3ReactConfig({
        dev: createConfig({ isDev: true }).build,
        build: createConfig().build,
    });
}

export async function build(opts?: Partial<{ isDev: boolean }>) {
    const c3ReactConfig = await findConfig();

    const config = (opts?.isDev === true) ? c3ReactConfig.dev : c3ReactConfig.build;
    const builder = await createBuilder(config);

    return await builder.buildApp();
}
