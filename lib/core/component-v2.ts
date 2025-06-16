/**
 * Компонент должен отвечать за отображение определенного участка
 * Не обязательная привязка к объекту
 * т.е чтобы компонент был сущностью в которой идёт управление отображением определенных
 * объектов, связанных между собой
 *
 * //TODO Кешированные компоненты (useComponent)
 */
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
        instance = object.instances().find((i) => condition(i));

        return instance;
    }

    instance = object.getFirstInstance() || undefined;

    return instance;
}

export const components = new ComponentsCollection();

export abstract class Component<
    S extends object | Array<any> = any,
    N extends keyof IConstructProjectObjects = any,
> {
    private static isInited: boolean = false;

    static init() {
        if (this.isInited) return;

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
            components.toArray().find((c) => c.instance === instance);
        });
    }

    private instance?: ExtractObjectInstType<N>;
    private state: S = {} as S;

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

    protected getState() {
        return this.state;
    }

    public setState(state: S | ((prevState: S) => S)) {
        if (typeof state === 'function') {
            this.state = state(this.state);
            this.onStateChanged?.();
        } else {
            this.state = state;
            this.onStateChanged?.();
        }
    }

    /**
     * Triggers when C3 "hieararchyready" event was detected on this component
     * - - -
     * Runtime Events
     * @see https://www.construct.net/en/make-games/manuals/construct-3/scripting/scripting-reference/iruntime#internalH1Link1
     */
    protected readonly onReady?: () => void;
    protected readonly onStateChanged?: () => void;
}

Component.init();
