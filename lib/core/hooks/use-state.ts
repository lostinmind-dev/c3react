import { EventsHandler } from '../events-handler.ts';

class State<V> extends EventsHandler<{
    'update': void,
}> {
    constructor(private value: V) {
        super();
    }

    getValue() {
        return this.value;
    }

    setValue(value: V) {
        this.value = value;
        this.emit('update');
    }
}

export function useState<S>(state: S | (() => S)) {
    const initial = typeof state === 'function'
        ? (state as () => S)()
        : state
        ;
    
    return new State(initial);
}