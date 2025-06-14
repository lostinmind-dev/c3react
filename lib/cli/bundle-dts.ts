import * as path from 'jsr:@std/path';

export async function bundleDts() {
    const FILE_NAME = 'ts-defs.d.ts';
    const references: string[] = [];
    const projectPath = path.join(Deno.cwd(), 'project');

    const addReference = (filePath: string) => {
        references.push(`/// <reference path="./${filePath.replaceAll('\\', '/')}" />`);
    }

    const readDir = async ($path: string) => {
        for await (const entry of Deno.readDir($path)) {
            if (entry.isDirectory) {
                await readDir(path.join($path, entry.name));
            } else if (entry.isFile && entry.name.endsWith('.d.ts')) {
                addReference(path.relative(
                    path.join(Deno.cwd()),
                    path.join($path, entry.name)
                ))
            }
        }

    }
    
    await readDir(projectPath);

    await Deno.writeTextFile(path.join(Deno.cwd(), FILE_NAME), references.join("\n") + "\n");
    console.log(`✅ Generated ${FILE_NAME} with ${references.length} references.`);
}