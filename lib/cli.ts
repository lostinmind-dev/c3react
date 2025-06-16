import { parseArgs } from 'jsr:@std/cli/parse-args';

/** Commands */
import { bundleDts } from './cli/bundle-dts.ts';
import { build } from './cli/build.ts';

async function main() {
    const args = parseArgs(Deno.args);

    if (args._.includes('bundledts')) {
        return await bundleDts();
    }

    if (args._.includes('build')) {
        return await build();
    }

    if (args._.includes('dev')) {
        return await build(true);
    }

    console.log(args);
}

await main();
