import type { Layout } from './layout.ts';
import { KeyboardSystem } from './input/keyboard.ts';
import { MouseSystem } from './input/mouse.ts';
import { PointerSystem } from './input/pointer.ts';

type InitOptions = Readonly<{
    layouts: Layout[];
    beforeStart: () => void | Promise<void>;
}>;

type EventHandler<Data = any> = (data: Data) => void;

export abstract class app {
    private static readonly events = new Map<
        keyof RuntimeEventMap,
        Set<EventHandler>
    >();
    private static isInited: boolean = false;

    private static globalize(runtime: IRuntime) {
        //@ts-ignore @GLOBAL
        globalThis.runtime = runtime;
        //@ts-ignore @GLOBAL
        globalThis.keyboard = new KeyboardSystem(runtime);
        //@ts-ignore @GLOBAL
        globalThis.mouse = new MouseSystem(runtime);
        //@ts-ignore @GLOBAL
        globalThis.pointer = new PointerSystem(runtime);
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
    }

    static release(): void {
        for (const [event, handlers] of this.events) {
            for (const handler of handlers) {
                runtime.removeEventListener(event, handler);
            }
        }

        this.events.clear();
    }
}

app.on('afteranylayoutend', () => {
    keyboard.release();
    pointer.release();
    mouse.release();
});
