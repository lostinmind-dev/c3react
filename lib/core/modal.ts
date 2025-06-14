import { app } from "./app.ts";
import { EventsHandler } from "./events-handler.ts";

export abstract class Modal<
    Events extends Record<string, any> = Record<string, any>,
    ShowProps extends object = object,
    HideProps extends object = object,
> extends EventsHandler<{
    'reset': void;
} & Events> {
    private static readonly modals = new Set<Modal<any>>();

    static init() {
        app.on('beforeanylayoutend', () => this.modals.forEach(modal => modal.reset()));
    }

    private readonly disabledLayers = new Set<string>();

    #isShowing: boolean = false;

    get isShowing() {
        return this.#isShowing;
    }

    protected readonly container!: InstanceType.container;

    private readonly layerName: string;
    private readonly layersToDisable: string[];

    constructor(
        private readonly templateName: string,
        opts?: {
            layerName?: string,
            layersToDisable?: string[],
        },
        readonly showProps?: ShowProps,
        readonly hideProps?: HideProps,
    ) {
        super();
        this.layerName = opts?.layerName || this.templateName;
        this.layersToDisable = opts?.layersToDisable || [];
        Modal.modals.add(this);
    }

    private reset() {
        this.emit('reset');
        this.#isShowing = false;
        //@ts-ignore;
        this.container = undefined;
    }

    private getOrCreateLayer() {
        let layer = runtime.layout.getLayer(this.layerName);

        if (!layer) {
            const topIndex = runtime.layout.getAllLayers().reduce((max, l) => l.index > max ? l.index : max, -Infinity);
            
            runtime.layout.addLayer(
                this.layerName,
                runtime.layout.getLayer(topIndex),
                'above'
            );

            layer = runtime.layout.getLayer(this.layerName)!;
            layer.parallaxX = 0;
            layer.parallaxY = 0;
        }

        return layer;
    }

    private defineContainer() {
        if (this.container) return;

        const layer = this.getOrCreateLayer();

        //@ts-ignore;
        this.container = runtime.objects.container.createInstance(
            layer.name,
            -1000,
            -1000,
            true,
            this.templateName
        );

        this.container.instVars.id = this.templateName;

        this.onReady();
    }

    protected disableLayer(layerName: string) {
        const layer = runtime.layout.getLayer(layerName);
        if (!layer) return false;
        layer.isInteractive = false;
        return true;
    }

    protected enableLayer(layerName: string) {
        const layer = runtime.layout.getLayer(layerName);
        if (layer) layer.isInteractive = true;
    }

    protected disableLayers() {
        this.layersToDisable.forEach(name => {
            if (this.disableLayer(name)) this.disabledLayers.add(name);
        });
    }

    protected enableLayers() {
        this.disabledLayers.forEach(name => {
            this.enableLayer(name);
            this.disabledLayers.delete(name);
        });
    }

    public async show(props?: ShowProps) {
        this.#isShowing = true;
        this.defineContainer();
        await this.onShow(props);
    }

    public async hide(props?: HideProps) {
        await this.onHide(props);
        this.#isShowing = false;
    }

    /** If it was created firstly */
    protected abstract onReady(): void | Promise<void>;
    protected abstract onShow(props?: ShowProps): void | Promise<void>;
    protected abstract onHide(props?: HideProps): void | Promise<void>;
}

Modal.init();