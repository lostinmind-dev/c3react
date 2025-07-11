import { app } from '../app.ts';
import { EventsHandler, type Event } from '../utils/events-handler.ts';

interface IC3ReactKeyboardEvent extends Event {
    type: 'down' | 'up',
    key: C3React.Keyboard.Key,
}

export class C3ReactKeyboard extends EventsHandler<{
    'down': KeyboardEvent;
    'up': KeyboardEvent;
}> {
    private static isInited: boolean = false;

    static init(keyboard: C3ReactKeyboard) {
        if (this.isInited) return;

        app.on('keydown', (e) => {
            
            const previousState = keyboard.keys.get(e.code);
            
            if (previousState !== 'down') {
                keyboard.keys.set(e.code, 'down');
                
            }

            keyboard.notifyListeners((event) => event.type === 'down' && event.key === e.code);
            keyboard.emit('down', e);
        });

        app.on('keyup', (e) => {
            keyboard.keys.set(e.code, 'up');

            keyboard.notifyListeners((event) => event.type === 'up' && event.key === e.code);
            keyboard.emit('up', e);
        });

        app.on('tick', () => keyboard.update());
        app.on('afteranylayoutend', () => keyboard.release());

        this.isInited = true;
    }

    private readonly keys = new Map<string, C3React.Keyboard.KeyState>();
    private previousKeys = new Map<string, C3React.Keyboard.KeyState>();
    
    private readonly listeners = new Set<IC3ReactKeyboardEvent>();

    private notifyListeners(filter?: (event: IC3ReactKeyboardEvent) => boolean) {
        let events = this.listeners;

        if (filter) {
            //@ts-ignore;
            const filteredEvents = Array.from(this.listeners).filter(event => filter(event));
            events = new Set(filteredEvents);
        }

        for (const event of events) {
            event.handler({});
            if (event.once) event.unsubscribe();
        }
    }

    private update() {
        this.previousKeys = new Map(this.keys);

        this.keys.forEach((state, key) => {
            if (state === 'down' && this.previousKeys.get(key) === 'down') {
                this.keys.set(key, 'pressed');
            }
        });
    }

    onPressed(key: C3React.Keyboard.Key, handler: () => void, opts?: Partial<{ once: boolean }>) {
        const unsubscribe = () => {
            this.listeners.delete(event);
        }

        const event: IC3ReactKeyboardEvent = {
            type: 'down',
            handler,
            unsubscribe,
            once: opts?.once || false,
            key,
        }

        this.listeners.add(event);

        return { unsubscribe };
    }

    onReleased(key: C3React.Keyboard.Key, handler: () => void, opts?: Partial<{ once: boolean }>) {
        const unsubscribe = () => {
            this.listeners.delete(event);
        }

        const event: IC3ReactKeyboardEvent = {
            type: 'up',
            handler,
            unsubscribe,
            once: opts?.once || false,
            key,
        }

        this.listeners.add(event);

        return { unsubscribe };
    }

    isPressed(key: C3React.Keyboard.Key) {
        return this.keys.get(key) === 'pressed';
    }

    isReleased(key: C3React.Keyboard.Key) {
        return this.keys.get(key) === 'up';
    }

    protected removeAllListeners() {
        super.release();
        this.listeners.clear();
    }
}

export const keyboard = new C3ReactKeyboard();