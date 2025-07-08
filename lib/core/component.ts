import { app } from './app.ts';
import { Collection } from './utils/collection.ts';
import { State } from './state.ts';

export type ExtractInstanceType<N extends keyof IConstructProjectObjects> =
    NonNullable<
        ReturnType<
            IConstructProjectObjects[N]['getFirstInstance']
        >
    >;

function getObject<N extends keyof IConstructProjectObjects>(
    name: N,
    pickBy?: (inst: ExtractInstanceType<N>) => boolean,
) {
    const object = runtime.objects[name];
    let instance: ExtractInstanceType<N> | undefined;

    if (pickBy) {
        instance = object.instances().find((i) => pickBy(i));

        return instance;
    }

    instance = object.getFirstInstance() || undefined;

    return instance;
}

export const components = new Collection<Component<any, any>>();

/**
 * Public methods are for using ONLY outside component
 * Protected methods are for using ONLY inside component
 * get/set without public/protected are for using BOTH inside AND outside component
 */

export abstract class Component<N extends keyof IConstructProjectObjects, S extends Record<string, any>> {
    private static initsCount: number = 0;

    static init() {
        if (this.initsCount > 0) return;

        app.on('instancecreate', ({ instance }) => {
            // console.log('INSTANCE READY UID:', instance.uid)
            const filteredComponents = components.toArray().filter((c) =>
                c.objectName === instance.objectType.name
            );

            let component: Component<any, any>;
            for (component of filteredComponents) {
                const pickedInstance = getObject(
                    component.objectName,
                    component.pickBy,
                );

                if (instance !== pickedInstance) continue;

                component.#isDestroyed = false;
                component.root = pickedInstance;

                component.onReady();
            }
        });

        //@ts-ignore;
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
                    component.state.removeAllListeners();
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

    private readonly objectName?: N;
    private readonly pickBy?: (inst: ExtractInstanceType<N>) => boolean;
    private root?: ExtractInstanceType<N>;

    readonly state: State<S>;

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

    constructor(opts: {
        objectName?: N,
        state: S | (() => S),
        pickBy?: (inst: ExtractInstanceType<N>) => boolean,
    }) {
        this.objectName = opts.objectName;
        this.pickBy = opts.pickBy;

        this.state = new State(opts.state);
        components.add(this);

        if (typeof runtime !== 'undefined' && this.objectName) {
            const root = getObject(this.objectName, this.pickBy);

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

    public destroyRoot() {
        if (this.isDestroyed || !this.root) {
            components.delete(this);
            return;
        };

        this.root.destroy();
    }
}

Component.init();

window.c3react['getComponents'] = () => {
    return [...components.toArray()];
}