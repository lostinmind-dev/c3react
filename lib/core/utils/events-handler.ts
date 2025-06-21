export type Handler<Data = any> = (data: Data) => void;

export class EventsHandler<
    Events extends Record<string, any>,
> {
    private readonly events = new Map<keyof Events, Set<Handler>>();

    on<Event extends keyof Events>(
        event: Event,
        handler: Handler<Events[Event]>,
    ) {
        let handlers = this.events.get(event);

        if (!handlers) {
            this.events.set(event, new Set());
            handlers = this.events.get(event)!;
        }

        handlers.add(handler);
    }

    protected emit<Event extends keyof Events>(
        event: Event,
        ...data: Events[Event] extends void ? [] : [Events[Event]]
    ) {
        const handlers = this.events.get(event);

        if (!handlers) return;

        for (const handler of handlers) {
            handler(data[0]);
        }
    }

    protected release() {
        this.events.clear();
    }
}
