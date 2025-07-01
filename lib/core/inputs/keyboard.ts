import { app } from '../app.ts';
import { EventsHandler } from '../utils/events-handler.ts';

export class C3ReactKeyboard extends EventsHandler<{
    'down': KeyboardEvent;
    'up': KeyboardEvent;
}> {
    private static isInited: boolean = false;

    static init(keyboard: C3ReactKeyboard) {
        if (this.isInited) return;

        app.on('keydown', (e) => {
            keyboard.emit('down', e);

            const previousState = keyboard.keys.get(e.code);

            if (previousState !== 'down') {
                keyboard.keys.set(e.code, 'down');

                const handlers = keyboard.pressListeners.get(e.code);

                if (!handlers) return;

                handlers.forEach(handler => handler());
            }
        });

        app.on('keyup', (e) => {
            keyboard.emit('up', e);

            keyboard.keys.set(e.code, 'up');

            const handlers = keyboard.releaseListeners.get(e.code);

            if (!handlers) return;

            handlers.forEach(handler => handler());
        });

        app.on('tick', () => keyboard.update());
        app.on('afteranylayoutend', () => keyboard.release());

        this.isInited = true;
    }

    private readonly keys = new Map<string, C3React.Keyboard.KeyState>();
    private previousKeys = new Map<string, C3React.Keyboard.KeyState>();
    
    private readonly pressListeners = new Map<string, Set<() => void>>();
    private readonly releaseListeners = new Map<string, Set<() => void>>();

    private update() {
        this.previousKeys = new Map(this.keys);

        this.keys.forEach((state, key) => {
            if (state === 'down' && this.previousKeys.get(key) === 'down') {
                this.keys.set(key, 'pressed');
            }
        });
    }

    onPressed(key: C3React.Keyboard.Key, handler: () => void) {
        let handlers = this.pressListeners.get(key);

        if (!handlers) {
            this.pressListeners.set(key, new Set());
            handlers = this.pressListeners.get(key)!;
        }

        handlers.add(handler);
    }

    onReleased(key: C3React.Keyboard.Key, handler: () => void) {
        let handlers = this.releaseListeners.get(key);

        if (!handlers) {
            this.releaseListeners.set(key, new Set());
            handlers = this.releaseListeners.get(key)!;
        }

        handlers.add(handler);
    }

    isPressed(key: C3React.Keyboard.Key) {
        return this.keys.get(key) === 'pressed';
    }

    isReleased(key: C3React.Keyboard.Key) {
        return this.keys.get(key) === 'up';
    }

    protected override release() {
        super.release();
        this.pressListeners.clear();
        this.releaseListeners.clear();
    }
}

export const keyboard = new C3ReactKeyboard();