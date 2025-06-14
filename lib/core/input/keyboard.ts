export class KeyboardSystem {
    readonly #anyPressHandlers = new Set<C3React.Keyboard.Handler>();
    readonly #pressListeners = new Map<string, Set<C3React.Keyboard.Handler>>();

    readonly #anyReleaseHandlers = new Set<C3React.Keyboard.Handler>();
    readonly #releaseListeneres = new Map<string, Set<C3React.Keyboard.Handler>>();

    readonly #keys = new Map<string, C3React.Keyboard.KeyState>();
    #previousKeys = new Map<string, C3React.Keyboard.KeyState>();

    constructor(runtime: IRuntime) {
        runtime.addEventListener('keydown', (e) => this.#onKeyDown(e));
        runtime.addEventListener('keyup', (e) => this.#onKeyUp(e));
        runtime.addEventListener('tick', () => this.#update());
    }

    onAnyKeyPressed(handler: C3React.Keyboard.Handler) {
        this.#anyPressHandlers.add(handler);

        return () => {
            this.#anyPressHandlers.delete(handler);
        }
    }

    onKeyPressed(key: C3React.Keyboard.Key, handler: C3React.Keyboard.Handler) {
        let handlers = this.#pressListeners.get(key);

        if (!handlers) {
            this.#pressListeners.set(key, new Set());
            handlers = this.#pressListeners.get(key)!;
        }

        handlers.add(handler);

        return () => {
            handlers.delete(handler);
        }
    }

    onAnyKeyReleased(handler: C3React.Keyboard.Handler) {
        this.#anyReleaseHandlers.add(handler);

        return () => {
            this.#anyReleaseHandlers.delete(handler);
        }
    }

    onKeyReleased(key: C3React.Keyboard.Key, handler: C3React.Keyboard.Handler) {
        let handlers = this.#releaseListeneres.get(key);

        if (!handlers) {
            this.#releaseListeneres.set(key, new Set());
            handlers = this.#releaseListeneres.get(key)!;
        }

        handlers.add(handler);

        return () => {
            handlers.delete(handler);
        }
    }

    isKeyPressed(key: C3React.Keyboard.Key) {
        return this.#keys.get(key) === 'pressed';
    }

    isKeyReleased(key: C3React.Keyboard.Key) {
        return this.#keys.get(key) === 'up';
    }

    #onKeyDown(e: KeyboardEvent) {
        for (const handler of this.#anyPressHandlers) {
            handler(e)
        }

        const previousState = this.#keys.get(e.code);

        if (previousState !== 'down') {
            this.#keys.set(e.code, 'down');

            const handlers = this.#pressListeners.get(e.code)

            if (!handlers) return;

            for (const handler of handlers) {
                handler(e);
            }
        }
    }

    #onKeyUp(e: KeyboardEvent) {
        for (const handler of this.#anyReleaseHandlers) {
            handler(e)
        }

        this.#keys.set(e.code, 'up');

        const handlers = this.#releaseListeneres.get(e.code)

        if (!handlers) return;

        for (const handler of handlers) {
            handler(e);
        }
    }

    #update() {
        this.#previousKeys = new Map(this.#keys);

        this.#keys.forEach((state, key) => {
            if (state === 'down' && this.#previousKeys.get(key) === 'down') {
                this.#keys.set(key, 'pressed');
            }
        });
    }

    /** Removes all listeners */
    release() {
        this.#anyPressHandlers.clear();
        this.#anyReleaseHandlers.clear();
        this.#pressListeners.clear();
        this.#releaseListeneres.clear();
        this.#keys.clear();
        this.#previousKeys.clear();
    }
}