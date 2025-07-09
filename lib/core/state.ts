type OnChangedEvent<V> = {
    handler: (newValue: V) => void,
    unsubscribe: () => void,
    once: boolean,
}

type StateValue =
    | string
    | number
    | boolean
    | object
;
export type StateType = Record<string, StateValue>;

export class State<S extends StateType> {
    private readonly initialValue: S;
    private value: S;

    private readonly listeners = new Map<keyof S, Set<OnChangedEvent<any>>>();

    constructor(initialValue: S | (() => S)) {
        const initial = typeof initialValue === 'function'
            ? initialValue()
            : initialValue
            ;

        this.initialValue = structuredClone(initial);
        this.value = structuredClone(initial);
    }

    reset() {
        this.value = structuredClone(this.initialValue);
    }

    change<K extends keyof S>(key: K, value: S[K] | ((prev: S[K]) => S[K])) {
        const prev = this.value[key];
        const next = typeof value === 'function'
            ? (value as (prev: S[K]) => S[K])(prev)
            : value;

        this.value[key] = next;

        const events = this.listeners.get(key);

        if (events) {
            for (const event of events) {
                event.handler(next);

                if (event.once) event.unsubscribe();
            }
        }
    }

    set(value: S | ((prevValue: S) => S)) {
        const next = typeof value === 'function'
            ? value(this.value)
            : value
            ;

        this.value = next;
    }

    get(): S;
    get<K extends keyof S>(key: K): S[K];
    get<K extends keyof S>(key?: K): S | S[K] {
        const state = this.value;
        return (typeof key === 'undefined') ? state : state[key];
    }

    onChanged<K extends keyof S>(key: K, handler: OnChangedEvent<S[K]>['handler'], opts?: Partial<{ once: boolean }>) {
        let events = this.listeners.get(key);

        if (!events) {
            this.listeners.set(key, new Set());
            events = this.listeners.get(key)!;
        }

        const unsubscribe = () => {
            events.delete(event);
        }

        const event: OnChangedEvent<S[K]> = {
            handler,
            unsubscribe,
            once: opts?.once || false,
        };

        events.add(event);

        return { unsubscribe };
    }

    removeAllListeners() {
        this.listeners.clear();
    }
}

const testState = new State({ items: [] });
