import { app } from './app.ts';
import { EventsHandler } from './events-handler.ts';

type UseObjectCondition<InstType> = (inst: InstType) => boolean;

function isContainer(inst: IWorldInstance): inst is InstanceType.container {
    return (
        'instVars' in inst &&
        typeof (inst.instVars as Record<string, any>)['id'] !== 'undefined'
    );
}

type ComponentConstructor<T extends Component = Component> = new (...args: any[]) => T;

export abstract class Component<
    Events extends Record<string, any> = Record<string, any>,
    Props extends object = object,
> extends EventsHandler<{
    'touch-start': void,
    'touch-end': void,
} & Events> {
    private static isInited: boolean = false;
    private static readonly components = new Set<Component<any>>();

    static init() {
        if (this.isInited) return;

        app.on('hierarchyready', ({ instance }) => {
            if (!isContainer(instance)) return;

            const component = Array.from(this.components).find(c => c.id === instance.instVars.id);
            if (!component) return;
            component.#ready(instance);
        });

        this.isInited = true;
    }

    // static create<T extends Type<Component>>(
    //     component: T,
    //     id: string,
    //     opts?: {
    //         layerName?: string | number,
    //         x?: number,
    //         y?: number,
    //         templateName?: string
    //     },
    // ) {
    //     const c = new component(id) as InstanceType<T>;

    //     const container = runtime.objects.container.createInstance(
    //         opts?.layerName || 0,
    //         opts?.x || 0,
    //         opts?.y || 0,
    //         (opts?.templateName) ? true : false,
    //         opts?.templateName,
    //     )

    //     container.instVars.id = id;

    //     return c;
    // }

    readonly container!: InstanceType.container;

    constructor(
        readonly id: string,
        readonly props: Props,
    ) {
        super();
        Component.components.add(this);
    }

    #ready(container: InstanceType.container) {
        //@ts-ignore;
        this.container = container;
        this.#onReady();
        this.onReady();
        this.update(this.props);
    }

    /** System onReady */
    #onReady() {
        const checkClick = () => {
            const layer = this.container.layer;
            if (!layer.isInteractive) return false;

            const { x, y } = pointer.current;
            const [translatedX, translatedY] = layer.cssPxToLayer(x, y);

            if (!this.isCoordsOverInstance(translatedX, translatedY)) return false;

            return true;
        }

        pointer.onDown(() => {
            if (checkClick()) this.emit('touch-start');
        });

        pointer.onUp(() => {
            if (checkClick()) this.emit('touch-end');
        });
    }

    private isCoordsOverInstance(x: number, y: number) {
        const bbox = this.container.getBoundingBox();

        return (
            x > bbox.left &&
            x < bbox.right &&
            y > bbox.top &&
            y < bbox.bottom
        );
    }

    protected useComponent<T extends Component>(
        component: ComponentConstructor<T>,
        id: string,
    ) {
        return (props: T['props']) => {
            if (Component.components.values().find(c => c.id === id)) return Array.from(Component.components).find(c => c.id === id) as T;

            const container = runtime.objects.container.instances().find(i => i.instVars.id === id);
            if (!container) throw new Error(`Container not found [ID: ${id}]`);

            const c = new component(id, props, container);
            c.#ready(container);
            return c;
        }
    }

    protected useComponents<T extends Component, Ids extends string[]>(component: ComponentConstructor<T>, ids: Ids) {
        return (props: Record<Ids[number], T['props']>) => {
            const collection = new Map<Ids[number], T>();

            const components = Array.from(Component.components.values().filter(c => ids.includes(c.id))) as T[] satisfies T[];

            const containers = runtime.objects.container.instances().filter(i => ids.includes(i.instVars.id));
            for (const container of containers) {
                const $props = props[container.instVars.id as Ids[number]]
                const c = new component(container.instVars.id, $props);
                c.#ready(container);
                components.push(c);
            }

            components.forEach(component => collection.set(component.id, component));

            return collection;
        }
    }

    protected useChild<
        ObjectName extends keyof IConstructProjectObjects,
        ChildInstType = NonNullable<ReturnType<IConstructProjectObjects[ObjectName]['getFirstInstance']>>
    >(
        objectName: ObjectName,
        condition?: UseObjectCondition<ChildInstType>,
        type: 'own' | 'all' = 'all',
    ) {
        return () => {
            let children: IteratorObject<IWorldInstance, undefined, unknown>;

            if (type === 'all') {
                children = this.container.allChildren().filter(i => i.objectType.name === objectName);
            } else {
                children = this.container.children().filter(i => i.objectType.name === objectName);
            }

            if (condition) {
                const child = children.toArray().find(i => condition(i as ChildInstType));

                if (child) return child as ChildInstType;

                console.log(`Child not found by condition [OBJECT_NAME: ${objectName}]`, condition)
                throw new Error(`Child not found by condition [OBJECT_NAME: ${objectName}]`);
            }

            const child = children.find(i => i.objectType.name === objectName);

            if (!child) throw new Error('Child not found');

            return child as ChildInstType;
        }
    }

    protected useChildren<
        ObjectName extends keyof IConstructProjectObjects,
        ChildInstType = NonNullable<ReturnType<IConstructProjectObjects[ObjectName]['getFirstInstance']>>
    >(
        objectName: ObjectName,
        type: 'own' | 'all' = 'all',
        condition?: UseObjectCondition<ChildInstType>
    ) {
        return () => {
            let children: IteratorObject<IWorldInstance, undefined, unknown>;

            if (type === 'all') {
                children = this.container.allChildren().filter(i => i.objectType.name === objectName);
            } else {
                children = this.container.children().filter(i => i.objectType.name === objectName);
            }

            if (condition) {
                const filtered = children.filter(i => condition(i as ChildInstType));

                return filtered.toArray() as ChildInstType[];
            }

            return children.toArray() as ChildInstType[];
        }
    }

    protected abstract onReady(): void | Promise<void>;
    abstract update(props?: Props): void | Promise<void>;
}

Component.init();