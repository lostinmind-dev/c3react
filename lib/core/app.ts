import type { Handler } from './utils/events-handler.ts';
import type { Layout } from './layout.ts';
import { initDevTools } from './dev-tools.ts';

class App {
    private readonly events = new Map<keyof RuntimeEventMap, Set<Handler>>();
    private readonly cachedSubscribers = new Set<() => void>();
    private isInited: boolean = false;

    init(opts: {
        devTools?: true,
        layouts: Layout[];
        beforeStart: () => void | Promise<void>;
    }) {
        if (this.isInited) return;

        if (opts.devTools) initDevTools();

        this.on('afteranylayoutend', () => this.cachedSubscribers.forEach(unsubscribe => unsubscribe()));

        runOnStartup(async (runtime) => {
            this.isInited = true;

            //@ts-ignore @GLOBAL
            globalThis.runtime = runtime;

            for (const [event, handlers] of this.events) {
                handlers.forEach((handler) =>
                    runtime.addEventListener(event, handler)
                );
            }

            await opts.beforeStart?.();
        });
    }

    /** Returns method for unsubscribing from event */
    on<Event extends keyof RuntimeEventMap>(
        event: Event,
        handler: Handler<RuntimeEventMap[Event]>,
        isCached?: true,
    ) {
        let handlers = this.events.get(event);

        if (!handlers) {
            this.events.set(event, new Set());
            handlers = this.events.get(event)!;
        }

        handlers.add(handler);
        if (typeof runtime !== 'undefined') runtime.addEventListener(event, handler);

        const unsubscribe = () => {
            runtime.removeEventListener(event, handler);
            handlers.delete(handler);
        }

        if (isCached) this.cachedSubscribers.add(unsubscribe);

        return unsubscribe;
    }

    async addScript(url: string) {
        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;

            script.onload = () => resolve();
            script.onerror = reject;

            document.head.appendChild(script);
        });
    }

}

export const app = new App();