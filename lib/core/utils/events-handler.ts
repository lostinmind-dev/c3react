export type Handler<Data = any> = (data: Data) => void;

type EventHandler = {
    method: Handler;
    once: boolean,
    unsubscribe: () => void,
}

export class EventsHandler<
    EventsMap extends Record<string, any>,
> {
    private readonly events = new Map<keyof EventsMap, Set<EventHandler>>();

    on<T extends keyof EventsMap>(
        event: T,
        handler: Handler<EventsMap[T]>,
        opts?: Partial<{
            once: true,
        }>
    ) {
        let handlers = this.events.get(event);

        if (!handlers) {
            this.events.set(event, new Set());
            handlers = this.events.get(event)!;
        }

        const unsubscribe = () => {
            handlers.delete(eventHandler);
        }

        const eventHandler: EventHandler = {
            method: handler,
            once: opts?.once || false,
            unsubscribe,
        };

        handlers.add(eventHandler);

        return eventHandler;
    }

    protected emit<T extends keyof EventsMap>(
        event: T,
        ...data: EventsMap[T] extends void ? [] : [EventsMap[T]]
    ) {
        const handlers = this.events.get(event);

        if (!handlers) return;

        for (const handler of handlers) {
            handler.method(data[0]);

            if (handler.once) handler.unsubscribe();
        }
    }

    protected release() {
        this.events.clear();
    }
}
