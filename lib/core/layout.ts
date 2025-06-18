import { app } from './app.ts';
import { Collection } from './collection.ts';

const layouts = new Collection<Layout>();

export abstract class Layout {
    private static initsCount: number = 0;

    static init() {
        if (this.initsCount > 0) return;

        app.on('beforeprojectstart', () => {
            layouts.toArray().forEach(layout => layout.setRoot(runtime.getLayout(layout.name)));
        });

        this.initsCount++;
    }

    private layout!: IAnyProjectLayout;

    constructor(private readonly name: string) {
        layouts.add(this);
    }

    protected getRoot() {
        if (!this.layout) throw new Error('Layout was NOT defined yet');

        return this.layout;
    }

    private setRoot(layout: IAnyProjectLayout) {
        if (this.layout) throw new Error(`Can't set ROOT layout, it was already defined before!`);

        layout.addEventListener('beforelayoutstart', () => this.beforeStart());
        layout.addEventListener('afterlayoutstart', () => this.onStart());
        layout.addEventListener('beforelayoutend', () => this.beforeEnd());
        layout.addEventListener('afterlayoutend', () => this.onEnd());

        this.layout = layout;
    }

    protected beforeStart() { }
    protected onStart() { }
    protected beforeEnd() { }
    protected onEnd() { }
}

Layout.init();
