const OUTPUT_FILE = 'lib/types/c3.d.ts';
const DEFINITIONS_DIR = './utils/ts-defs';

function walk(dir: string): string[] {
    const result: string[] = [];
    for (const entry of Deno.readDirSync(dir)) {
        const fullPath = `${dir}/${entry.name}`;
        if (entry.isDirectory) {
            result.push(...walk(fullPath));
        } else if (entry.isFile && fullPath.endsWith('.d.ts')) {
            result.push(fullPath);
        }
    }
    return result;
}

function relativeReference(from: string, to: string): string {
    return `/// <reference path="${
        to.replace(from + '/', './../').replaceAll('\\', '/')
    }" />`;
}

const dtsFiles = walk(DEFINITIONS_DIR);
const references = dtsFiles.map((file) => relativeReference('', file));

await Deno.writeTextFile(OUTPUT_FILE, references.join('\n') + '\n');

console.log(
    `✅ Generated ${OUTPUT_FILE} with ${references.length} references.`,
);
