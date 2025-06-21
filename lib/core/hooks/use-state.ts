import { EventsHandler } from '../utils/events-handler.ts';

class State<V> extends EventsHandler<{
    'update': { prevValue?: V },
}> {
    constructor(private value: V) {
        super();
    }

    getValue() {
        return this.value;
    }

    setValue(value: V) {
        let prevValue: V | undefined;

        if (
            typeof this.value === 'number' ||
            typeof this.value === 'string' ||
            typeof this.value === 'boolean'
        ) {
            prevValue = this.value;
        } else {
            prevValue = undefined
        }

        this.value = value;
        this.emit('update', { prevValue });
    }
}

export function useState<S>(state: S | (() => S)) {
    const initial = typeof state === 'function'
        ? (state as () => S)()
        : state
        ;
    
    return new State(initial);
}