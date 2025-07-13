import type { CoordinatesType } from './pointer.ts';
import type { App } from '../app.ts';
import { EventsHandler, type Event } from '../utils/events-handler.ts';

interface IC3ReactMouseEvent extends Event {
    type: 'button' | 'wheel',
};

interface IC3ReactMouseButtonEvent extends IC3ReactMouseEvent {
    type: 'button',
    clickType: 'double-click' | 'click' | 'release',
    button: C3React.Mouse.Buttons[keyof C3React.Mouse.Buttons],
}

interface IC3ReactMouseWheelEvent extends IC3ReactMouseEvent {
    type: 'wheel',
    direction: C3React.Mouse.WheelDirection,
}

type Events = {
    button: IC3ReactMouseButtonEvent,
    wheel: IC3ReactMouseWheelEvent,
}

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
    private static isInited: boolean = false;

    static init(app: App<any>, mouse: C3ReactMouse) {
        if (this.isInited) return;

        app.on('mousedown', (e) => {
            mouse.coordinates.set('start', {
                x: e.clientX,
                y: e.clientY
            });

            const previousState = mouse.buttons.get(e.button);
            if (previousState !== 'down') {
                mouse.buttons.set(e.button, 'down');

                mouse.notifyListeners('button', (event) => event.clickType === 'click' && event.button === e.button);
            }

            mouse.emit('down', e);
        });

        app.on('mousemove', (e) => {
            const [currentX, currentY] = mouse.getCoords('current');

            mouse.coordinates.set('previous', {
                x: currentX,
                y: currentY
            });

            mouse.coordinates.set('current', {
                x: e.clientX,
                y: e.clientY,
            });


            mouse.emit('move', e);
        });

        app.on('mouseup', (e) => {
            const [currentX, currentY] = mouse.getCoords('current');
            mouse.coordinates.set('end', {
                x: currentX,
                y: currentY,
            });

            mouse.buttons.set(e.button, 'up');

            mouse.notifyListeners('button', (event) => event.clickType === 'release' && event.button === e.button);
            mouse.emit('up', e);
        });

        app.on('dblclick', (e) => {
            mouse.notifyListeners('button', (event) => event.clickType === 'double-click' && event.button === e.button);
            mouse.emit('dblclick', e);
        });


        app.on('wheel', (e) => {
            const direction: C3React.Mouse.WheelDirection = (e.deltaY > 0)
                ? 'down'
                : 'up';

            mouse.notifyListeners('wheel', (event) => event.direction === direction);
            mouse.emit('wheel', e);
        });

        app.on('tick', () => mouse.update())
        app.on('afteranylayoutend', () => mouse.removeAllListeners());

        this.isInited = true;
    }

    private readonly coordinates = new Map<CoordinatesType, C3React.Position>();

    private readonly buttons = new Map<number, C3React.Mouse.ButtonState>();
    private previousButtons = new Map<number, C3React.Mouse.ButtonState>();

    private readonly listeners = new Map<keyof Events, Set<Events[keyof Events]>>();

    constructor() {
        super();

        this.coordinates.set('start', { x: 0, y: 0 });
        this.coordinates.set('current', { x: 0, y: 0 });
        this.coordinates.set('previous', { x: 0, y: 0 });
        this.coordinates.set('end', { x: 0, y: 0 });
    }

    private notifyListeners<E extends keyof Events>(event: E, filter?: (event: Events[E]) => boolean) {
        let events = this.listeners.get(event);

        if (!events) return;
        if (filter) {
            //@ts-ignore;
            const filteredEvents = Array.from(events).filter(event => filter(event));
            events = new Set(filteredEvents);
        }

        for (const event of events) {
            event.handler({});
            if (event.once) event.unsubscribe();
        }
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

    onClicked(button: keyof C3React.Mouse.Buttons, handler: () => void, opts?: Partial<{ once: boolean }>) {
        let events = this.listeners.get('button');

        if (!events) {
            this.listeners.set('button', new Set());
            events = this.listeners.get('button')!;
        }

        const unsubscribe = () => {
            events.delete(event);
        }

        const event: IC3ReactMouseButtonEvent = {
            type: 'button',
            clickType: 'click',
            handler,
            unsubscribe,
            button: BUTTONS[button],
            once: opts?.once || false,
        }

        events.add(event);

        return { unsubscribe };
    }

    onReleased(button: keyof C3React.Mouse.Buttons, handler: () => void, opts?: Partial<{ once: boolean }>) {
        let events = this.listeners.get('button');

        if (!events) {
            this.listeners.set('button', new Set());
            events = this.listeners.get('button')!;
        }

        const unsubscribe = () => {
            events.delete(event);
        }

        const event: IC3ReactMouseButtonEvent = {
            type: 'button',
            clickType: 'release',
            handler,
            unsubscribe,
            button: BUTTONS[button],
            once: opts?.once || false,
        }

        events.add(event);

        return { unsubscribe };
    }

    onDblClicked(button: keyof C3React.Mouse.Buttons, handler: () => void, opts?: Partial<{ once: boolean }>) {
        let events = this.listeners.get('button');

        if (!events) {
            this.listeners.set('button', new Set());
            events = this.listeners.get('button')!;
        }

        const unsubscribe = () => {
            events.delete(event);
        }

        const event: IC3ReactMouseButtonEvent = {
            type: 'button',
            clickType: 'double-click',
            handler,
            unsubscribe,
            button: BUTTONS[button],
            once: opts?.once || false,
        }

        events.add(event);

        return { unsubscribe };
    }

    onWheel(direction: C3React.Mouse.WheelDirection, handler: () => void, opts?: Partial<{ once: boolean }>) {

        let events = this.listeners.get('wheel');

        if (!events) {
            this.listeners.set('wheel', new Set());
            events = this.listeners.get('wheel')!;
        }

        const unsubscribe = () => {
            events.delete(event);
        }

        const event: IC3ReactMouseWheelEvent = {
            type: 'wheel',
            handler,
            unsubscribe,
            direction,
            once: opts?.once || false,
        }

        events.add(event);

        return { unsubscribe };
    }

    isPressed(button: keyof C3React.Mouse.Buttons) {
        return this.buttons.get(BUTTONS[button]) === 'pressed';
    }

    isReleased(button: keyof C3React.Mouse.Buttons) {
        return this.buttons.get(BUTTONS[button]) === 'up';
    }

    getCoords<T extends CoordinatesType>(type: T) {
        const { x, y } = this.coordinates.get(type)!;
        return [x, y] as const;
    }

    protected removeAllListeners() {
        super.release();
        this.buttons.clear();
        this.previousButtons.clear();
        this.listeners.clear();
    }
}

export const mouse = new C3ReactMouse();