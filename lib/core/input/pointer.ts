export class PointerSystem {
    readonly #downHandlers = new Set<C3React.Pointer.Handler>();
    readonly #moveHandlers = new Set<C3React.Pointer.Handler>();
    readonly #upHandlers = new Set<C3React.Pointer.Handler>();
    readonly #cancelHandlers = new Set<C3React.Pointer.Handler>();

    readonly start: C3React.Position = { x: 0, y: 0 };
    readonly current: C3React.Position = { x: 0, y: 0 };
    readonly previous: C3React.Position = { x: 0, y: 0 };
    readonly end: C3React.Position = { x: 0, y: 0 };

    constructor(runtime: IRuntime) {
        runtime.addEventListener('pointerdown', (e) => this.#onDown(e));
        runtime.addEventListener('pointermove', (e) => this.#onMove(e));
        runtime.addEventListener('pointerup', (e) => this.#onUp(e));
        runtime.addEventListener('pointercancel', (e) => this.#onCancel(e));
    }

    isOverInstance(instance: IWorldInstance) {
        const { x, y } = this.current;
        const [translatedX, translatedY] = instance.layer.cssPxToLayer(x, y);
        const bbox = instance.getBoundingBox();

        return (
            translatedX > bbox.left &&
            translatedX < bbox.right &&
            translatedY > bbox.top &&
            translatedY < bbox.bottom
        );
    }

    onDown(handler: C3React.Pointer.Handler) {
        this.#downHandlers.add(handler);

        return () => {
            this.#downHandlers.delete(handler);
        };
    }

    onMove(handler: C3React.Pointer.Handler) {
        this.#moveHandlers.add(handler);

        return () => {
            this.#moveHandlers.delete(handler);
        };
    }

    onUp(handler: C3React.Pointer.Handler) {
        this.#upHandlers.add(handler);

        return () => {
            this.#upHandlers.delete(handler);
        };
    }

    onCancel(handler: C3React.Pointer.Handler) {
        this.#cancelHandlers.add(handler);

        return () => {
            this.#cancelHandlers.delete(handler);
        };
    }

    #onDown(e: ConstructPointerEvent) {
        this.start.x = e.clientX;
        this.start.y = e.clientY;

        for (const handler of this.#downHandlers) {
            handler(e);
        }
    }

    #onMove(e: ConstructPointerEvent) {
        this.previous.x = this.current.x;
        this.previous.y = this.current.y;

        this.current.x = e.clientX;
        this.current.y = e.clientY;

        for (const handler of this.#moveHandlers) {
            handler(e);
        }
    }

    #onUp(e: ConstructPointerEvent) {
        this.end.x = e.clientX;
        this.end.y = e.clientY;

        for (const handler of this.#upHandlers) {
            handler(e);
        }
    }

    #onCancel(e: ConstructPointerEvent) {
        for (const handler of this.#upHandlers) {
            handler(e);
        }
    }

    release() {
        this.#downHandlers.clear();
        this.#moveHandlers.clear();
        this.#upHandlers.clear();
        this.#cancelHandlers.clear();
    }
}
