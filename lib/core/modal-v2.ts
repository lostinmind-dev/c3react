import { pickInst, type ExtractObjectInstType } from './component.ts';
import { Collection } from './collection.ts';
import { createInst } from './hooks/create-inst.ts';
import { app } from './app.ts';

const modals = new Collection<Modal<any>>();

export abstract class Modal<N extends keyof IConstructProjectObjects> {
    private static initsCount = 0;

    static init() {
        if (this.initsCount > 0) return;

        app.on('instancecreate', ({ instance }) => {
            const filteredModals = modals.toArray().filter((m) =>
                m.objectName === instance.objectType.name
            );

            let modal: Modal<any>;
            for (modal of filteredModals) {
                const pickedInstance = pickInst(
                    modal.objectName,
                    (i) => i.templateName === modal.templateName,
                );

                if (instance !== pickedInstance) continue;

                modal.root = pickedInstance;
            }
        });

        app.on('instancedestroy', ({ instance }) => {
            const modal = modals.toArray().find((c) => c.root === instance);
            if (modal) modal.root = undefined;
        });

        app.on('hierarchyready', ({ instance }) => {
            const modal = modals.toArray().find((c) =>
                c.root === instance
            );
            if (modal) modal.onReady();
        });

        // app.on('afteranylayoutend', () => {
        //     modals.toArray().forEach(m => m.#isShowing = false)
        // })

        this.initsCount++;
    }

    private root?: ExtractObjectInstType<N>;

    #isShowing: boolean = false;

    get isShowing() {
        return this.#isShowing;
    }

    constructor(
        private readonly objectName: N,
        private readonly templateName: string,
        private layerName: string,
    ) {
        modals.add(this);
    }

    private createRoot() {
        if (this.root) return;

        const { layerName, templateName } = this;

        let layer = runtime.layout.getLayer(this.layerName);

        if (!layer) {
            const topIndex = runtime.layout.getAllLayers().reduce(
                (max, l) => l.index > max ? l.index : max,
                -Infinity,
            );

            runtime.layout.addLayer(
                this.layerName,
                runtime.layout.getLayer(topIndex),
                'above',
            );

            layer = runtime.layout.getLayer(this.layerName)!;
            layer.parallaxX = 0;
            layer.parallaxY = 0;
        }

        this.root = createInst(this.objectName, {
            layerName,
            templateName,
        });
    }

    public hide() {
        this.#isShowing = false;
        this.onHide();
    }

    public show(layerName?: string) {
        if (layerName) this.layerName;

        this.#isShowing = true;

        if (!this.root) this.createRoot();

        this.onShow();
    }

    protected onReady() { }
    protected onShow() { }
    protected onHide() { }
}

Modal.init();