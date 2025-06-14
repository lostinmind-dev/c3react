
import { parseArgs } from 'jsr:@std/cli/parse-args';
import { bundleDts } from './cli/bundle-dts.ts';

async function main() {
    const args = parseArgs(Deno.args);

    if (args._.includes('bundledts')) {
        return await bundleDts();
    }
}

await main();