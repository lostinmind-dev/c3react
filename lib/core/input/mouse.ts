export const BUTTONS = {
    left: 0,
    middle: 1,
    right: 2,

    fourth: 3,
    fifth: 4,
} as const;

export class MouseSystem {
    readonly #moveHandlers = new Set<C3React.Mouse.Handler>();
    readonly #clickListeners = new Map<
        number | 'any',
        Set<C3React.Mouse.Handler>
    >();
    readonly #dblClickListeners = new Map<
        number | 'any',
        Set<C3React.Mouse.Handler>
    >();
    readonly #releaseListeneres = new Map<
        number | 'any',
        Set<C3React.Mouse.Handler>
    >();
    readonly #wheelListeners = new Map<
        C3React.Mouse.WheelDirection,
        Set<C3React.Mouse.Handler>
    >();

    readonly #buttons = new Map<number, C3React.Mouse.ButtonState>();
    #previousButtons = new Map<number, C3React.Mouse.ButtonState>();

    readonly start: C3React.Position = { x: 0, y: 0 };
    readonly current: C3React.Position = { x: 0, y: 0 };
    readonly previous: C3React.Position = { x: 0, y: 0 };
    readonly end: C3React.Position = { x: 0, y: 0 };

    constructor(runtime: IRuntime) {
        runtime.addEventListener('mousedown', (e) => this.#onDown(e));
        runtime.addEventListener('mousemove', (e) => this.#onMove(e));
        runtime.addEventListener('mouseup', (e) => this.#onUp(e));
        runtime.addEventListener('dblclick', (e) => this.#onDblClick(e));
        runtime.addEventListener('wheel', (e) => this.#onWheel(e));
        runtime.addEventListener('tick', () => this.#update());
    }

    onMove(handler: C3React.Mouse.Handler) {
        this.#moveHandlers.add(handler);

        return () => {
            this.#moveHandlers.delete(handler);
        };
    }

    onButtonClicked(
        button: keyof typeof BUTTONS | 'any',
        handler: C3React.Mouse.Handler,
    ) {
        const key = (button === 'any') ? 'any' : BUTTONS[button];

        let handlers = this.#clickListeners.get(key);

        if (!handlers) {
            this.#clickListeners.set(key, new Set());
            handlers = this.#clickListeners.get(key)!;
        }

        handlers.add(handler);

        return () => {
            handlers.delete(handler);
        };
    }

    onButtonReleased(
        button: keyof typeof BUTTONS | 'any',
        handler: C3React.Mouse.Handler,
    ) {
        const key = (button === 'any') ? 'any' : BUTTONS[button];

        let handlers = this.#releaseListeneres.get(key);

        if (!handlers) {
            this.#releaseListeneres.set(key, new Set());
            handlers = this.#releaseListeneres.get(key)!;
        }

        handlers.add(handler);

        return () => {
            handlers.delete(handler);
        };
    }

    onMouseWheel(
        direction: C3React.Mouse.WheelDirection,
        handler: C3React.Mouse.Handler,
    ) {
        let handlers = this.#wheelListeners.get(direction);

        if (!handlers) {
            this.#wheelListeners.set(direction, new Set());
            handlers = this.#wheelListeners.get(direction)!;
        }

        handlers.add(handler);

        return () => {
            handlers.delete(handler);
        };
    }

    onDoubleClicked(
        button: keyof typeof BUTTONS | 'any',
        handler: C3React.Mouse.Handler,
    ) {
        const key = (button === 'any') ? 'any' : BUTTONS[button];

        let handlers = this.#dblClickListeners.get(key);

        if (!handlers) {
            this.#dblClickListeners.set(key, new Set());
            handlers = this.#dblClickListeners.get(key)!;
        }

        handlers.add(handler);

        return () => {
            handlers.delete(handler);
        };
    }

    isButtonPressed(button: keyof typeof BUTTONS) {
        return this.#buttons.get(BUTTONS[button]) === 'pressed';
    }

    isButtonReleased(button: keyof typeof BUTTONS) {
        return this.#buttons.get(BUTTONS[button]) === 'up';
    }

    #onWheel(e: WheelEvent) {
        const direction: C3React.Mouse.WheelDirection = (e.deltaY > 0)
            ? 'down'
            : 'up';

        const handlers = this.#wheelListeners.get(direction);

        if (!handlers) return;

        for (const handler of handlers) {
            handler(e);
        }
    }

    #onDown(e: MouseEvent) {
        this.start.x = e.clientX;
        this.start.y = e.clientY;

        const previousState = this.#buttons.get(e.button);

        if (previousState !== 'down') {
            this.#buttons.set(e.button, 'down');

            const handlers = this.#clickListeners.get(e.button);

            if (handlers) {
                for (const handler of handlers) {
                    handler(e);
                }
            }

            const anyHandlers = this.#clickListeners.get('any');

            if (anyHandlers) {
                for (const handler of anyHandlers) {
                    handler(e);
                }
            }
        }
    }

    #onMove(e: MouseEvent) {
        this.previous.x = this.current.x;
        this.previous.y = this.current.y;

        this.current.x = e.clientX;
        this.current.y = e.clientY;

        for (const handler of this.#moveHandlers) {
            handler(e);
        }
    }

    #onUp(e: MouseEvent) {
        this.end.x = e.clientX;
        this.end.y = e.clientY;

        this.#buttons.set(e.button, 'up');

        const handlers = this.#releaseListeneres.get(e.button);

        if (handlers) {
            for (const handler of handlers) {
                handler(e);
            }
        }

        const anyHandlers = this.#releaseListeneres.get('any');

        if (anyHandlers) {
            for (const handler of anyHandlers) {
                handler(e);
            }
        }
    }

    #onDblClick(e: MouseEvent) {
        const handlers = this.#dblClickListeners.get(e.button);

        if (handlers) {
            for (const handler of handlers) {
                handler(e);
            }
        }
    }

    #update() {
        this.#previousButtons = new Map(this.#buttons);

        this.#buttons.forEach((state, button) => {
            if (
                state === 'down' && this.#previousButtons.get(button) === 'down'
            ) {
                this.#buttons.set(button, 'pressed');
            }
        });
    }

    /** Removes all listeners */
    release() {
        this.#moveHandlers.clear();
        this.#clickListeners.clear();
        this.#dblClickListeners.clear();
        this.#releaseListeneres.clear();
        this.#wheelListeners.clear();
        this.#buttons.clear();
        this.#previousButtons.clear();
    }
}
