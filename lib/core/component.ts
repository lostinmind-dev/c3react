import type { Handler } from './utils/events-handler.ts';
import { app } from './app.ts';
import { Collection } from './utils/collection.ts';

export type ExtractObjectInstType<N extends keyof IConstructProjectObjects> =
    NonNullable<
        ReturnType<
            IConstructProjectObjects[N]['getFirstInstance']
        >
    >;

function useObject<N extends keyof IConstructProjectObjects>(
    name: N,
    pickBy?: (inst: ExtractObjectInstType<N>) => boolean,
) {
    const object = runtime.objects[name];
    let instance: ExtractObjectInstType<N> | undefined;

    if (pickBy) {
        //@ts-ignore;
        instance = object.instances().find((i) => pickBy(i));

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

export abstract class Component<
    S extends object = any,
    N extends keyof IConstructProjectObjects = any
> {
    private static initsCount: number = 0;

    static init() {
        if (this.initsCount > 0) return;

        app.on('instancecreate', ({ instance }) => {
            // console.log('INSTANCE READY UID:', instance.uid)
            const filteredComponents = components.toArray().filter((c) =>
                c.objectName === instance.objectType.name
            );

            let component: Component;
            for (component of filteredComponents) {
                const pickedInstance = useObject(
                    component.objectName,
                    component.pickBy,
                );

                if (instance !== pickedInstance) continue;

                component.#isDestroyed = false;
                component.root = pickedInstance;

                component.onReady();
            }
        });

        app.on('hierarchyready', ({ instance }) => {
            // console.log('HIERARCHY READY UID:', instance.uid, instance)
            const filteredComponents = components.toArray().filter((c) =>
                c.root && c.root.uid === instance.uid
            );

            filteredComponents.forEach(c => c.onHierarchyReady());
        });

        app.on('instancedestroy', ({ instance }) => {
            const component = components.toArray().find((c) => c.root === instance);
            if (component) {
                component.#isDestroyed = true;
                component.onDestroyed();
                // component.root = undefined;
                if (component.isCached) {
                    component.onChangedEvents.clear();
                    components.delete(component);
                };
            }
        });

        app.on('afteranylayoutend', () => {
            const cachedComponents = components.toArray().filter(c => c.isCached);
            cachedComponents.forEach(c => components.delete(c));
        });

        this.initsCount++;
    }

    private readonly onChangedEvents = new Map<string, Set<Handler>>();
    private root?: ExtractObjectInstType<N>;
    private state: S;

    #isDestroyed: boolean = false;

    get isDestroyed() {
        return this.#isDestroyed;
    }

    protected get isReady() {
        return typeof this.root !== 'undefined'; 
    }

    /**
     * Cached components will be deleted from global collection after any layout end
     */
    protected isCached: boolean = false;

    constructor(
        initialState: S,
        private readonly objectName?: N,
        private readonly pickBy?: (inst: ExtractObjectInstType<N>) => boolean,
    ) {
        this.state = initialState;
        components.add(this);

        if (typeof runtime !== 'undefined' && objectName) {
            const root = useObject(objectName, pickBy);

            if (root) {
                this.root = root;
                this.onReady();

                root.addEventListener('hierarchyready', () => this.onHierarchyReady());
            }
        }
    }

    /**
     * Returns ROOT instance of component that was found by provided "objectName" & optional "pickCondition" in constructor
     */
    protected getRoot() {
        if (!this.root) throw new Error(`Root instance was NOT defined yet`);

        return this.root;
    }

    /**
     * Triggers when C3 "hieararchyready" event was detected on this component
     * - - -
     * Runtime Events
     * @see https://www.construct.net/en/make-games/manuals/construct-3/scripting/scripting-reference/iruntime#internalH1Link1
     */
    protected onReady() { };

    protected onHierarchyReady() { };

    /** Triggers when ROOT instance was destroyed */
    protected onDestroyed() { };

    protected onChanged<K extends string & keyof S>(key: K, handler: Handler<S[K]>) {
        let handlers = this.onChangedEvents.get(key);

        if (!handlers) {
            this.onChangedEvents.set(key, new Set());
            handlers = this.onChangedEvents.get(key)!;
        }

        handlers.add(handler);
    }

    public getState() {
        return this.state;
    }

    public change<K extends string & keyof S>(key: K, value: S[K]) {
        const handlers = this.onChangedEvents.get(key);

        if (handlers) handlers.forEach(handler => handler(this.state[key]));

        this.state[key] = value;
    }

    public destroyRoot() {
        if (this.isDestroyed || !this.root) {
            components.delete(this);
            return;
        };

        this.root.destroy();
    }
}

Component.init();