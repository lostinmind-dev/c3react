import { join } from 'node:path';

const layoutMainTsContent = `
import { Layout } from 'c3react';

export default class Main extends Layout {
    constructor() { super('main') }

    protected beforeStart() {

    }

    protected onStart() {

    }

    protected beforeEnd() {

    }

    protected onEnd() {
        
    }
}
`

const mainTsContent = `
import app from 'c3react';

app.init({
    inputs: ['pointer', 'mouse', 'keyboard'],
    layouts: [],
    beforeStart: async () => {
        /** Do someting it's like runOnStartup() inside block  */
    },
});
`

export async function create() {
    console.log('📍Creating C3React project...');
    const root = Deno.cwd()

    await Deno.mkdir(join(root, 'project'), { recursive: true });
    await Deno.mkdir(join(root, 'scripts'), { recursive: true });
    await Deno.mkdir(join(root, 'scripts', 'layouts'), { recursive: true });
    await Deno.writeTextFile(join(root, 'scripts', 'layouts', 'main.layout.ts'), layoutMainTsContent);

    /** Create ".gitignore" */
    await Deno.writeTextFile(join(root, '.gitignore'), `node_modules/\n*.js\n`);

    /** Create "deno.json" */
    await Deno.writeTextFile(join(root, 'deno.json'), JSON.stringify({
        nodeModulesDir: 'manual',
        name: '@c3react/template',
        version: '1.0.0',
        compilerOptions: {
            noImplicitOverride: false,
            types: [
                './ts-defs.d.ts',
            ],
            lib: [
                'deno.ns',
                'dom',
                'dom.asynciterable',
                'dom.iterable',
            ],
        },
        tasks: {
            bundledts: 'c3react bundledts',
            dev: 'c3react dev',
            build: 'c3react build',
        },
        imports: {
            'c3react': 'file:C:/Users/llost/OneDrive/Documents/GitHub/@lostinmind/c3react/lib/core.ts',
            '@/': './scripts/',
            '@project/': './project/files/',
        },
        fmt: {
            singleQuote: true,
            indentWidth: 4,
            lineWidth: 120,
        }
    }, null, 4));

    await Deno.writeTextFile(join(root, 'scripts', 'main.ts'), mainTsContent);

    console.log('✅ Successfully created C3React project!');
}
