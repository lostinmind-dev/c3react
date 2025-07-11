import { createBuilder } from 'npm:vite@7.0.4';
import { createConfig } from './vite-config.ts';

export async function build(prod?: true) {
    const builder = await createBuilder(createConfig(prod));

    return await builder.buildApp();
}
