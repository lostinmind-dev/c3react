import { app } from './app.ts';
import { Collection } from './collection.ts';
import { createInst } from './hooks/create-inst.ts';

export type ExtractObjectInstType<N extends keyof IConstructProjectObjects> =
    NonNullable<
        ReturnType<
            IConstructProjectObjects[N]['getFirstInstance']
        >
    >;

export function pickInst<N extends keyof IConstructProjectObjects>(
    objectName: N,
    condition?: (inst: ExtractObjectInstType<N>) => boolean,
) {
    const object = runtime.objects[objectName];
    let instance: ExtractObjectInstType<N> | undefined;

    if (condition) {
        //@ts-ignore;
        instance = object.instances().find((i) => condition(i));

        return instance;
    }

    //@ts-ignore;
    instance = object.getFirstInstance() || undefined;

    return instance;
}

export const components = new Collection<Component>();

/**
 * Public methods are for using ONLY outside component
 * Protected methods are for using ONLY inside component
 * get/set without public/protected are for using BOTH inside AND outside component
 */

export abstract class Component<N extends keyof IConstructProjectObjects = any>{
    private static initsCount: number = 0;

    static init() {
        if (this.initsCount > 0) return;

        app.on('instancecreate', ({ instance }) => {
            const filteredComponents = components.toArray().filter((c) =>
                c.objectName === instance.objectType.name
            );

            let component: Component;
            for (component of filteredComponents) {
                const pickedInstance = pickInst(
                    component.objectName,
                    component.pickCondition,
                );

                if (instance !== pickedInstance) continue;

                component.#isDestroyed = false;
                component.root = pickedInstance;
            }
        });

        app.on('hierarchyready', ({ instance }) => {
            const component = components.toArray().find((c) =>
                c.root === instance
            );
            if (component) component.onRootReady();
        });

        app.on('instancedestroy', ({ instance }) => {
            const component = components.toArray().find((c) => c.root === instance);
            if (component) {
                component.#isDestroyed = true;
                component.onRootDestroyed();
                component.root = undefined;
                if (component.isCached) components.delete(component);
            }
        });

        app.on('afteranylayoutend', () => {
            const cachedComponents = components.toArray().filter(c => c.isCached);
            cachedComponents.forEach(c => components.delete(c));
        });

        this.initsCount++;
    }

    private root?: ExtractObjectInstType<N>;

    #isDestroyed: boolean = false;

    get isDestroyed() {
        return this.#isDestroyed;
    }

    /**
     * Cached components will be deleted from global collection after any layout end
     */
    #isCached: boolean = false;

    protected get isCached() {
        return this.#isCached;
    }

    protected set isCached(v: boolean) {
        this.#isCached = v;
    }

    constructor(
        private readonly objectName?: N,
        private readonly pickCondition?: (inst: ExtractObjectInstType<N>) => boolean,
    ) {
        components.add(this);
    }

    /**
     * Returns ROOT instance of component that was found by provided "objectName" & optional "pickCondition" in constructor
     */
    protected getRoot() {
        if (!this.root) {
            if (!this.objectName) {
                throw new Error(`Can't use root instance NOT visual component`);
            }
            throw new Error(`Root instance was NOT defined yet`);
        }

        return this.root;
    }

    /** 
     * It will set ROOT instance only if it's undefined
     * In other cases you will get an error
     * Also it will call onReady() method
     * @description 
     * Use this method for cases when you creating instance, setting up properties 
     * For example modifying *instance.instVars* for success condition in component class
     */
    protected setRoot(root: ExtractObjectInstType<N>) {
        if (this.root) throw new Error(`Can't set ROOT instance, it was already defined before!`);

        this.root = root;
        this.onRootReady();
    }

    /**
     * Triggers when C3 "hieararchyready" event was detected on this component
     * - - -
     * Runtime Events
     * @see https://www.construct.net/en/make-games/manuals/construct-3/scripting/scripting-reference/iruntime#internalH1Link1
     */
    protected onRootReady() { };

    /** Triggers when ROOT instance was destroyed */
    protected onRootDestroyed() { };

    public createRoot(opts?: Parameters<typeof createInst>[1]) {
        if (!this.objectName) return;

        this.root = createInst(this.objectName, opts)
    }

    public destroyRoot() {
        if (this.isDestroyed || !this.root) return;

        this.root.destroy();
    }
}

Component.init();