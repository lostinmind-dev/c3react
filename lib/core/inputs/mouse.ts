import { app } from '../app.ts';
import { EventsHandler } from '../events-handler.ts';

const BUTTONS: C3React.Mouse.Buttons = {
    left: 0,
    middle: 1,
    right: 2,

    fourth: 3,
    fifth: 4,
};


export class C3ReactMouse extends EventsHandler<{
    'down': MouseEvent;
    'move': MouseEvent;
    'dblclick': MouseEvent,
    'up': MouseEvent;
    'wheel': WheelEvent;
}> {
    private isInited: boolean = false;

    private readonly coordinates = {
        start: { x: 0, y: 0 },
        current: { x: 0, y: 0 },
        previous: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
    } satisfies Record<'start' | 'current' | 'previous' | 'end', C3React.Position>;

    private readonly buttons = new Map<number, C3React.Mouse.ButtonState>();
    private previousButtons = new Map<number, C3React.Mouse.ButtonState>();

    private readonly clickListeners = new Map<number, Set<() => void>>();
    private readonly releaseListeners = new Map<number, Set<() => void>>();
    private readonly dblClickListeners = new Map<number, Set<() => void>>();
    private readonly wheelListeners = new Map<C3React.Mouse.WheelDirection, Set<() => void>>();

    public init() {
        if (this.isInited) return;

        app.on('mousedown', (e) => {
            this.coordinates.start = {
                x: e.clientX,
                y: e.clientY
            };

            const previousState = this.buttons.get(e.button);
            if (previousState !== 'down') {
                this.buttons.set(e.button, 'down');

                const handlers = this.clickListeners.get(e.button);

                if (handlers) handlers.forEach(handler => handler());
            }

            this.emit('down', e);
        });

        app.on('mousemove', (e) => {
            this.coordinates.previous = {
                x: this.coordinates.current.x,
                y: this.coordinates.current.y,
            };

            this.coordinates.current = {
                x: e.clientX,
                y: e.clientY,
            };

            this.buttons.set(e.button, 'up');

            const handlers = this.releaseListeners.get(e.button);

            if (handlers) handlers.forEach(handler => handler());

            this.emit('move', e);
        });

        app.on('dblclick', (e) => this.emit('dblclick', e));


        app.on('wheel', (e) => {
            const direction: C3React.Mouse.WheelDirection = (e.deltaY > 0)
                ? 'down'
                : 'up';

            const handlers = this.wheelListeners.get(direction);

            if (handlers) handlers.forEach(handler => handler());

            this.emit('wheel', e);
        });

        app.on('tick', () => this.update())
        app.on('afteranylayoutend', () => this.release());

        this.isInited = true;
    }

    private update() {
        this.previousButtons = new Map(this.buttons);

        this.buttons.forEach((state, button) => {
            if (
                state === 'down' && this.previousButtons.get(button) === 'down'
            ) {
                this.buttons.set(button, 'pressed');
            }
        });
    }

    onClicked(button: keyof C3React.Mouse.Buttons, handler: () => void) {
        const key = BUTTONS[button];

        let handlers = this.clickListeners.get(key);

        if (!handlers) {
            this.clickListeners.set(key, new Set());
            handlers = this.clickListeners.get(key)!;
        }

        handlers.add(handler);
    }

    onReleased(button: keyof C3React.Mouse.Buttons, handler: () => void) {
        const key = BUTTONS[button];

        let handlers = this.releaseListeners.get(key);

        if (!handlers) {
            this.releaseListeners.set(key, new Set());
            handlers = this.releaseListeners.get(key)!;
        }

        handlers.add(handler);
    }

    onDblClicked(button: keyof C3React.Mouse.Buttons, handler: () => void) {
        const key = BUTTONS[button];

        let handlers = this.dblClickListeners.get(key);

        if (!handlers) {
            this.dblClickListeners.set(key, new Set());
            handlers = this.dblClickListeners.get(key)!;
        }

        handlers.add(handler);
    }

    onWheel(direction: C3React.Mouse.WheelDirection, handler: () => void) {
        let handlers = this.wheelListeners.get(direction);

        if (!handlers) {
            this.wheelListeners.set(direction, new Set());
            handlers = this.wheelListeners.get(direction)!;
        }

        handlers.add(handler);
    }

    isPressed(button: keyof C3React.Mouse.Buttons) {
        return this.buttons.get(BUTTONS[button]) === 'pressed';
    }

    isReleased(button: keyof C3React.Mouse.Buttons) {
        return this.buttons.get(BUTTONS[button]) === 'up';
    }

    getCoords<T extends keyof typeof this.coordinates>(type: T) {
        const {x, y}= this.coordinates[type];
        return [x, y] as const;
    }

    protected override release(): void {
        super.release();
        this.buttons.clear();
        this.previousButtons.clear();
        this.clickListeners.clear();
        this.releaseListeners.clear();
        this.dblClickListeners.clear();
        this.wheelListeners.clear();
    }
}

export const mouse = new C3ReactMouse();