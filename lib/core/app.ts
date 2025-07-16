import type { Event, Handler } from './utils/events-handler.ts';
import { Layout } from './layout.ts';
import { C3ReactKeyboard } from './inputs/keyboard.ts';
import { C3ReactMouse } from './inputs/mouse.ts';
import { C3ReactPointer } from './inputs/pointer.ts';
import { State, type StateType } from './state.ts';
import { Component } from './component.ts';

interface IAppEvent extends Event {
    cached: boolean,
}

export class App<S extends StateType> {
    public static instance: App<any>;

    private isInited: boolean = false;

    private readonly listeners = new Map<keyof RuntimeEventMap, Set<IAppEvent>>();
    private readonly layouts: Layout[] = [];
    readonly state: State<S>;

    constructor(initialState: S | (() => S)) {
        App.instance = this;

        const initial = typeof initialState === 'function'
            ? initialState()
            : initialState
            ;

        this.state = new State(initial);

        Layout.init(this);
        Component.init(this);
    }

    private addRuntimeEventListener(eventName: keyof RuntimeEventMap, event: IAppEvent) {
        if (event.once) {
            runtime.addEventListener(eventName, (e) => {
                event.handler(e);
                event.unsubscribe();
            });
        } else {
            runtime.addEventListener(eventName, event.handler)
        }
    }

    init(opts: {
        layouts: (new () => Layout)[], //| readonly Layout[],
        beforeStart?: () => void | Promise<void>,
    }) {
        if (this.isInited) return;

        for (const layout of opts.layouts) {
            this.layouts.push(new layout());
        }

        C3ReactKeyboard.init(this);
        C3ReactMouse.init(this);
        C3ReactPointer.init(this);

        this.on('afteranylayoutend', () => {
            const cachedEvents = this.listeners
                .values()
                .toArray()
                .map(handlers => handlers.values().toArray())
                .flat()
                .filter(handler => handler.cached === true)
                ;

            cachedEvents.forEach(event => event.unsubscribe())
        });

        runOnStartup(async (runtime) => {
            this.isInited = true;

            //@ts-ignore @GLOBAL
            globalThis.runtime = runtime;

            for (const [eventName, events] of this.listeners) {
                events.forEach(event => this.addRuntimeEventListener(eventName, event));
            }

            await opts.beforeStart?.();
        });
    }

    /** Returns method for unsubscribing from event */
    on<Event extends keyof RuntimeEventMap>(
        eventName: Event,
        handler: Handler<RuntimeEventMap[Event]>,
        opts?: Partial<{
            cached: true,
            once: true,
        }>
    ) {
        let events = this.listeners.get(eventName);

        if (!events) {
            this.listeners.set(eventName, new Set());
            events = this.listeners.get(eventName)!;
        }

        const unsubscribe = () => {
            if (typeof runtime !== 'undefined') runtime.removeEventListener(eventName, handler);
            events.delete(event);
        }

        const event: IAppEvent = {
            handler,
            once: opts?.once || false,
            cached: opts?.cached || false,
            unsubscribe,
        }

        events.add(event);

        if (typeof runtime !== 'undefined') this.addRuntimeEventListener(eventName, event);

        return { unsubscribe };
    }
}

window['c3react'] = {
    getComponents: () => { return [] }
};