import { createBuilder } from 'npm:vite';
import { createConfig } from './vite-config.ts';

export async function build(dev?: true) {
    const builder = await createBuilder(createConfig(dev));

    return await builder.buildApp();
}
