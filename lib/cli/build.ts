import { createBuilder } from 'npm:vite';
import { createConfig } from './vite-config.ts';

export async function build(prod?: true) {
    const builder = await createBuilder(createConfig(prod));

    return await builder.buildApp();
}
