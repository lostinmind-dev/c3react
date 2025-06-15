import { app } from './app.ts';
import { EventsHandler } from './events-handler.ts';

export type UseProps<Props> =
    Props extends object
    ? () => Props
    :
    Props extends Promise<Props>
    ? () => Promise<Props>
    : null
    ;

function isContainer(inst: IWorldInstance): inst is InstanceType.container {
    return (
        'instVars' in inst &&
        typeof (inst.instVars as Record<string, any>)['id'] !== 'undefined'
    );
}
export type UseChildCondition<InstType> = (inst: InstType) => boolean;
export type ComponentConstructor<T extends Component = Component> = new (...args: any[]) => T;

export abstract class Component<Props = any> extends EventsHandler<{
    'touch-start': void,
    'touch-end': void,
    'reset': void,
}> {
    private static isInited: boolean = false;
    private static readonly cache = new Set<Component>();
    static readonly components = new Set<Component>();

    static init() {
        if (this.isInited) return;

        app.on('hierarchyready', ({ instance }) => {
            if (!isContainer(instance)) return;

            const component = Array.from(this.components).find(c => c.id === instance.instVars.id);
            if (!component) return;
            component.#ready(instance);
        });

        app.on('afteranylayoutend', () => {
            this.components.forEach(component => component.#reset());
            this.cache.forEach(component => this.components.delete(component));
            this.cache.clear();
        })

        this.isInited = true;
    }

    static ready(component: Component, container: InstanceType.container) {
        this.cache.add(component);
        component.#ready(container);
    }

    readonly container!: InstanceType.container;

    constructor(
        readonly id: string,
        protected readonly useProps: UseProps<Props>,
    ) {
        super();
        Component.components.add(this);
    }

    /** System onReady */
    #init() {
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

    #reset() {
        this.emit('reset');
        this.release();
    }

    #ready(container: InstanceType.container) {
        //@ts-ignore;
        this.container = container;
        this.#init();
        this.onReady();
        this.update();
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

    protected abstract onReady(): void | Promise<void>;
    abstract update(): void | Promise<void>;
}

Component.init();