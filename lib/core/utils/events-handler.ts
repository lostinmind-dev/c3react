export type Handler<T = any> = (data: T) => void;

export type Event<T = any> = {
    handler: Handler<T>,
    unsubscribe: () => void,
    once: boolean,
}

export class EventsHandler<
    EventsMap extends Record<string, any>,
> {
    readonly #listeners = new Map<keyof EventsMap, Set<Event>>();

    on<T extends keyof EventsMap>(
        eventName: T,
        handler: Handler<EventsMap[T]>,
        opts?: Partial<{
            once: true,
        }>
    ) {
        let handlers = this.#listeners.get(eventName);

        if (!handlers) {
            this.#listeners.set(eventName, new Set());
            handlers = this.#listeners.get(eventName)!;
        }

        const unsubscribe = () => {
            handlers.delete(event);
        }

        const event: Event = {
            handler,
            once: opts?.once || false,
            unsubscribe,
        };

        handlers.add(event);

        return { unsubscribe };
    }

    protected emit<T extends keyof EventsMap>(
        event: T,
        ...data: EventsMap[T] extends void ? [] : [EventsMap[T]]
    ) {
        const handlers = this.#listeners.get(event);

        if (!handlers) return;

        for (const handler of handlers) {
            handler.handler(data[0]);

            if (handler.once) handler.unsubscribe();
        }
    }

    protected release() {
        this.#listeners.clear();
    }
}
