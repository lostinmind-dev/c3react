import type { Layout } from './layout.ts';

type InitOptions = Readonly<{
    layouts: Layout[];
    beforeStart: () => void | Promise<void>;
}>;

type EventHandler<Data = any> = (data: Data) => void;

export abstract class app {
    private static readonly events = new Map<keyof RuntimeEventMap, Set<EventHandler>>();
    private static readonly cachedSubscribers = new Set<() => void>();
    private static isInited: boolean = false;

    private static globalize(runtime: IRuntime) {
        //@ts-ignore @GLOBAL
        globalThis.runtime = runtime;
    }

    static async addScript(url: string) {
        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;

            script.onload = () => resolve();
            script.onerror = reject;

            document.head.appendChild(script);
        });
    }

    static init(opts: InitOptions) {
        if (this.isInited) return;

        app.on('afteranylayoutend', () => this.cachedSubscribers.forEach(unsubscribe => unsubscribe()));

        runOnStartup(async (runtime) => {
            this.isInited = true;

            this.globalize(runtime);

            for (const [event, handlers] of this.events) {
                handlers.forEach((handler) =>
                    runtime.addEventListener(event, handler)
                );
            }

            await opts.beforeStart?.();
        });
    }

    /** Cached callback, will be unsubscribed after any layout end */
    static onCached<Event extends keyof RuntimeEventMap>(
        event: Event,
        handler: EventHandler<RuntimeEventMap[Event]>,
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

        this.cachedSubscribers.add(unsubscribe);
    }

    /** Returns method for unsubscribing from event */
    static on<Event extends keyof RuntimeEventMap>(
        event: Event,
        handler: EventHandler<RuntimeEventMap[Event]>,
    ) {
        let handlers = this.events.get(event);

        if (!handlers) {
            this.events.set(event, new Set());
            handlers = this.events.get(event)!;
        }

        handlers.add(handler);
        if (typeof runtime !== 'undefined') runtime.addEventListener(event, handler);

        return () => {
            runtime.removeEventListener(event, handler);
            handlers.delete(handler);
        }
    }

    // static release(): void {
    //     for (const [event, handlers] of this.events) {
    //         for (const handler of handlers) {
    //             runtime.removeEventListener(event, handler);
    //         }
    //     }

    //     this.events.clear();
    // }
}