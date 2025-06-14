import { app } from './app.ts';

export abstract class Layout {
    private static isInited: boolean = false;
    private static readonly layouts = new Set<Layout>();

    static init() {
        if (this.isInited) return;

        app.on('beforeprojectstart', () => {
            this.layouts.forEach(l => l.ready())
        });

        this.isInited = true;
    }

    readonly layout!: IAnyProjectLayout;

    constructor(private readonly name: string) {
        Layout.layouts.add(this);
    };

    private ready() {
        //@ts-ignore;
        this.layout = runtime.getLayout(this.name);

        this.layout.addEventListener('beforelayoutstart', () => this.beforeStart?.());
        this.layout.addEventListener('afterlayoutstart', () => this.onStart?.());
        this.layout.addEventListener('beforelayoutend', () => this.beforeEnd?.());
        this.layout.addEventListener('afterlayoutend', () => this.onEnd?.());
    }

    protected readonly beforeStart?: () => void;
    protected readonly onStart?: () => void;
    protected readonly beforeEnd?: () => void;
    protected readonly onEnd?: () => void;
}

Layout.init();