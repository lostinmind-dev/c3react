import { app } from './app.ts';

export type ExtractObjectInstType<N extends keyof IConstructProjectObjects> =
    NonNullable<
        ReturnType<
            IConstructProjectObjects[N]['getFirstInstance']
        >
    >;

class ComponentsCollection {
    private readonly collection = new Set<Component>();

    clear() {
        this.collection.clear();
    }

    delete(component: Component) {
        this.collection.delete(component);
    }

    add(component: Component) {
        this.collection.add(component);
    }

    toArray() {
        return Array.from(this.collection);
    }
}

function pickInst<N extends keyof IConstructProjectObjects>(
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

export const components = new ComponentsCollection();

export abstract class Component<
    S extends Record<string, any> | Array<any> = any,
    N extends keyof IConstructProjectObjects = any,
> {
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
                // if (instance['instVars'] && instance['instVars']['id']) {
                //     console.log(instance.instVars['id'])
                // }
                if (instance !== pickedInstance) continue;

                component.#isDestroyed = false;
                component.instance = pickedInstance;
            }
        });

        app.on('hierarchyready', ({ instance }) => {
            const component = components.toArray().find((c) =>
                c.instance === instance
            );
            if (component) component.onReady?.();
        });

        app.on('instancedestroy', ({ instance }) => {
            const component = components.toArray().find((c) => c.instance === instance);
            if (component) {
                component.#isDestroyed = true;
                component.onDestroyed?.();
            }
        });

        app.on('afteranylayoutend', () => {
            const cachedComponents = components.toArray().filter(c => c.isCached);
            cachedComponents.forEach(c => components.delete(c));
        })

        this.initsCount++;
    }

    private instance?: ExtractObjectInstType<N>;
    private state: S = {} as S;

    #isDestroyed: boolean = false;

    protected get isDestroyed() {
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
        initialState?: S | (() => S),
        private readonly objectName?: N,
        private readonly pickCondition?: (
            inst: ExtractObjectInstType<N>,
        ) => boolean,
    ) {
        this.state = (typeof initialState === 'function')
            ? initialState()
            : initialState;

        components.add(this);
    }

    /**
     * Returns ROOT instance of component that was found by provided "objectName" & optional "pickCondition" in constructor
     */
    protected getRoot() {
        if (!this.instance) {
            if (!this.objectName) {
                throw new Error(`Can't use root instance NOT visual component`);
            }
            throw new Error(`Root instance was NOT defined yet`);
        }

        return this.instance;
    }

    /** 
     * It will set ROOT instance only if it's undefined
     * In other cases you will get an error
     * Also it will call onReady() method
     * @description 
     * Use this method for cases when you creating instance, setting up properties 
     * For example modifying *instance.instVars* for success condition in component class
     */
    public setRoot(instance: ExtractObjectInstType<N>) {
        if (this.instance) throw new Error(`Can't set ROOT instance, it was already defined before!`);

        this.instance = instance;
        this.onReady?.();
    }

    protected getState() {
        return this.state;
    }

    public setState(state: Partial<S> | ((prevState: S) => Partial<S>)) {
        if (typeof state === 'function') {
            const $ = state(this.state);

            let key: keyof S;
            for (key in $) {
                if (typeof $[key] === 'undefined') continue;
                this.state[key] = $[key]!;
            }
            this.onStateChanged?.();
        } else {
            let key: keyof S;
            for (key in state) {
                if (typeof state[key] === 'undefined') continue;
                this.state[key] = state[key]!;
            }
            this.onStateChanged?.();
        }
    }

    public destroy() {
        if (this.isDestroyed || !this.instance) return;

        this.instance.destroy();
    }

    /**
     * Triggers when C3 "hieararchyready" event was detected on this component
     * - - -
     * Runtime Events
     * @see https://www.construct.net/en/make-games/manuals/construct-3/scripting/scripting-reference/iruntime#internalH1Link1
     */
    protected readonly onReady?: () => void;
    /**
     * Triggers when ROOT instance was destroyed
     */
    protected readonly onDestroyed?: () => void;
    protected readonly onStateChanged?: () => void;
}

Component.init();