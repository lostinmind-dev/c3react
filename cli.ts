import { parseArgs } from 'jsr:@std/cli@1.0.20/parse-args';
import chalk from 'npm:chalk@5.4.1';

/** Commands */
import { bundleDts } from './cli/bundle-dts.ts';
import { build } from './cli/build.ts';
import { create } from './cli/create.ts';

function printHelp() {
    console.log(`
        ${chalk.bold.cyan('C3React CLI Tool')}
        ${chalk.gray('Usage:')} ${chalk.green('c3react')} ${chalk.yellow('<command>')} [options]
        
        ${chalk.bold('Available commands:')}
        
        ${chalk.yellow('create')}          ${chalk.white('Create empty project')}
        ${chalk.yellow('dev')}             ${chalk.white('Start development mode')}
        ${chalk.yellow('build')}           ${chalk.white('Build the project')}
        ${chalk.yellow('bundledts')}       ${chalk.white('Bundle all C3 .d.ts into "ts-defs.d.ts"')}
        ${chalk.yellow('help')}            ${chalk.white('Show this help message')}
        `);
        // ${chalk.yellow('version')}         ${chalk.white('Show CLI version')}
        // ${chalk.bold('Options:')}
        
        // ${chalk.cyan('--verbose')}         ${chalk.white('Enable verbose output')}
        // ${chalk.cyan('--config')}          ${chalk.white('Path to custom config file')}
        // ${chalk.bold('Examples:')}
        
        // ${chalk.gray('$')} ${chalk.green('mycli')} ${chalk.yellow('init')}
        // ${chalk.gray('$')} ${chalk.green('mycli')} ${chalk.yellow('build')} --config ./config.json
}

async function main() {
    const args = parseArgs(Deno.args);

    if (args._.includes('help')) {
        return printHelp();
    }

    if (args._.includes('bundledts')) {
        return await bundleDts();
    }

    if (args._.includes('build')) {
        return await build();
    }

    if (args._.includes('dev')) {
        return await build({ isDev: true });
    }

    if (args._.includes('create')) {
        return await create();
    }

    return printHelp();
}

await main();

export type { IConfig } from './cli/config.ts';