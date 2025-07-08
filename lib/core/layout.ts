import { app } from './app.ts';
import { Collection } from './utils/collection.ts';

export const layouts = new Collection<Layout>();

export abstract class Layout {
    private static initsCount: number = 0;

    static init() {
        if (this.initsCount > 0) return;

        app.on('beforeprojectstart', () => {
            layouts.toArray().forEach(layout => layout.setRoot(runtime.getLayout(layout.name)));
        });

        this.initsCount++;
    }

    private root?: IAnyProjectLayout;

    constructor(private readonly name: string) {
        layouts.add(this);
    }

    protected getRoot() {
        if (!this.root) throw new Error('Layout was NOT defined yet');

        return this.root;
    }

    private setRoot(layout: IAnyProjectLayout) {
        if (this.root) throw new Error(`Can't set ROOT layout, it was already defined before!`);

        layout.addEventListener('beforelayoutstart', () => this.beforeStart());
        layout.addEventListener('afterlayoutstart', () => this.onStart());
        layout.addEventListener('beforelayoutend', () => this.beforeEnd());
        layout.addEventListener('afterlayoutend', () => this.onEnd());

        this.root = layout;
    }

    protected beforeStart() { }
    protected onStart() { }
    protected beforeEnd() { }
    protected onEnd() { }
}

Layout.init();