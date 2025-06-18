import { app } from './app.ts';
import { Collection } from './collection.ts';
import { createInst } from './hooks/create-inst.ts';

export type ExtractObjectInstType<N extends keyof IConstructProjectObjects> =
    NonNullable<
        ReturnType<
            IConstructProjectObjects[N]['getFirstInstance']
        >
    >;

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

function clone<T>(obj: T) {
    const proto = Object.getPrototypeOf(obj);
    const clone = Object.create(proto);
    return Object.assign(clone, obj) as T;
}

export const components = new Collection<Component>();

/**
 * Public methods are for using ONLY outside component
 * Protected methods are for using ONLY inside component
 * get/set without public/protected are for using BOTH inside AND outside component
 */
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
            if (component) component.onReady();
        });

        app.on('instancedestroy', ({ instance }) => {
            const component = components.toArray().find((c) => c.instance === instance);
            if (component) {
                component.#isDestroyed = true;
                component.onDestroyed();
                component.instance = undefined;
                if (component.isCached) components.delete(component);
            }
        });

        app.on('afteranylayoutend', () => {
            const cachedComponents = components.toArray().filter(c => c.isCached);
            cachedComponents.forEach(c => components.delete(c));
        })

        this.initsCount++;
    }

    private instance?: ExtractObjectInstType<N>;
    private previousState: S = {} as S;
    private state: S = {} as S;

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
    protected setRoot(instance: ExtractObjectInstType<N>) {
        if (this.instance) throw new Error(`Can't set ROOT instance, it was already defined before!`);

        this.instance = instance;
        this.onReady();
    }

    protected getState() {
        return this.state;
    }

    protected getPreviousState() {
        return this.previousState;
    }

    public setState(state: Partial<S> | ((prevState: S) => Partial<S>)) {
        
        if (typeof state === 'function') {
            this.previousState = clone(this.state);

            const $ = state(this.state);

            let key: keyof S;
            for (key in $) {
                // if (typeof $[key] === 'undefined') continue;
                this.state[key] = $[key]!;
            }
            this.onStateChanged();
        } else {
            this.previousState = clone(this.state);

            let key: keyof S;
            for (key in state) {
                // if (typeof state[key] === 'undefined') continue;
                this.state[key] = state[key]!;
            }
            this.onStateChanged();
        }
    }

    /**
     * Triggers when C3 "hieararchyready" event was detected on this component
     * - - -
     * Runtime Events
     * @see https://www.construct.net/en/make-games/manuals/construct-3/scripting/scripting-reference/iruntime#internalH1Link1
     */
    protected onReady() { };

    /** Truggers when setState() was called */
    protected onStateChanged() { };

    /** Triggers when ROOT instance was destroyed */
    protected onDestroyed() { };

    public create(opts?: Parameters<typeof createInst>[1]) {
        if (!this.objectName) return;

        this.instance = createInst(this.objectName, opts)
    }

    public destroy() {
        if (this.isDestroyed || !this.instance) return;

        this.instance.destroy();
    }
}

Component.init();