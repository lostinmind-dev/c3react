import type { App } from './app.ts';

export const layouts = new Map<string, Layout>();

export abstract class Layout {
    private static initsCount: number = 0;

    static init(app: App<any>) {
        if (this.initsCount > 0) return;

        app.on('beforeanylayoutstart', (e) => {
            const layout = layouts.get(e.layout.name);
            if (!layout) return;
            layout.beforeStart();
        });

        app.on('afteranylayoutstart', (e) => {
            const layout = layouts.get(e.layout.name);
            if (!layout) return;
            layout.onStart();
        });

        app.on('beforeanylayoutend', (e) => {
            const layout = layouts.get(e.layout.name);
            if (!layout) return;
            layout.beforeEnd();
        });

        app.on('afteranylayoutend', (e) => {
            const layout = layouts.get(e.layout.name);
            if (!layout) return;
            layout.onEnd();
        });

        this.initsCount++;
    }

    private root?: IAnyProjectLayout;

    constructor(private readonly name: string) {
        layouts.set(name, this);
    }

    protected getRoot() {
        if (!this.root) throw new Error('Layout was NOT defined yet');

        return this.root;
    }

    protected beforeStart() { }
    protected onStart() { }
    protected beforeEnd() { }
    protected onEnd() { }
}