import type { Handler } from './utils/events-handler.ts';
import type { Layout } from './layout.ts';
import { C3ReactKeyboard, keyboard } from './inputs/keyboard.ts';
import { C3ReactMouse, mouse } from './inputs/mouse.ts';
import { C3ReactPointer, pointer } from './inputs/pointer.ts';

type AppHandler = {
    method: Handler;
    cached: boolean,
    once: boolean,
    unsubscribe: () => void,
}

class App {
    private isInited: boolean = false;

    private readonly events = new Map<keyof RuntimeEventMap, Set<AppHandler>>();

    private addRuntimeEventListener(event: keyof RuntimeEventMap, appHandler: AppHandler) {
        if (appHandler.once) {
            runtime.addEventListener(event, (e) => {
                appHandler.method(e);
                appHandler.unsubscribe();
            });
        } else {
            runtime.addEventListener(event, appHandler.method)
        }
    }

    init(opts: {
        inputs?: ('keyboard' | 'mouse' | 'pointer')[],
        layouts: (new () => Layout)[], //| readonly Layout[],
        beforeStart: () => void | Promise<void>,
    }) {
        if (this.isInited) return;

        for (const layout of opts.layouts) {
            new layout();
        }

        if (opts?.inputs) {
            const inputs = new Set(opts.inputs);

            if (inputs.has('keyboard')) C3ReactKeyboard.init(keyboard);
            if (inputs.has('mouse')) C3ReactMouse.init(mouse);
            if (inputs.has('pointer')) C3ReactPointer.init(pointer);
        }

        this.on('afteranylayoutend', () => {
            const cachedHandlers = this.events
                .values()
                .toArray()
                .map(handlers => handlers.values().toArray())
                .flat()
                .filter(handler => handler.cached)
                ;

            cachedHandlers.forEach(handler => handler.unsubscribe())
        });

        runOnStartup(async (runtime) => {
            this.isInited = true;

            //@ts-ignore @GLOBAL
            globalThis.runtime = runtime;


            for (const [event, appHandlers] of this.events) {
                appHandlers.forEach(appHandler => this.addRuntimeEventListener(event, appHandler));
            }

            await opts.beforeStart?.();
        });
    }

    /** Returns method for unsubscribing from event */
    on<Event extends keyof RuntimeEventMap>(
        event: Event,
        handler: Handler<RuntimeEventMap[Event]>,
        opts?: Partial<{
            cached: true,
            once: true,
        }>
    ) {
        let handlers = this.events.get(event);

        if (!handlers) {
            this.events.set(event, new Set());
            handlers = this.events.get(event)!;
        }

        const unsubscribe = () => {
            if (typeof runtime !== 'undefined') runtime.removeEventListener(event, handler);
            handlers.delete(appHandler);
        }

        const appHandler: AppHandler = {
            method: handler,
            once: opts?.once || false,
            cached: opts?.cached || false,
            unsubscribe,
        }

        handlers.add(appHandler);

        if (typeof runtime !== 'undefined') this.addRuntimeEventListener(event, appHandler);

        return appHandler;
    }
}

export const app = new App();


window['c3react'] = {
    getComponents: () => { return [] }
};