import { join, relative } from 'node:path';

export async function bundleDts() {
    const FILE_NAME = 'ts-defs.d.ts';
    const references: string[] = [];
    const projectPath = join(Deno.cwd(), 'project');

    const addReference = (filePath: string) => {
        references.push(
            `/// <reference path="./${filePath.replaceAll('\\', '/')}" />`,
        );
    };

    const readDir = async ($path: string) => {
        for await (const entry of Deno.readDir($path)) {
            if (entry.isDirectory) {
                await readDir(join($path, entry.name));
            } else if (entry.isFile && entry.name.endsWith('.d.ts')) {
                addReference(relative(
                    join(Deno.cwd()),
                    join($path, entry.name),
                ));
            }
        }
    };

    await readDir(projectPath);

    await Deno.writeTextFile(
        join(Deno.cwd(), FILE_NAME),
        references.join('\n') + '\n',
    );
    console.log(
        `✅ Generated ${FILE_NAME} with ${references.length} references.`,
    );
}
