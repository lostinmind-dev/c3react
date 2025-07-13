import type { App } from '../app.ts';
import { type Event, EventsHandler } from '../utils/events-handler.ts';

export type CoordinatesType = 'start' | 'current' | 'previous' | 'end';

interface IC3ReactPointerEvent extends Event {
    type: 'down' | 'up',
}

export class C3ReactPointer extends EventsHandler<{
    'down': ConstructPointerEvent;
    'move': ConstructPointerEvent;
    'up': ConstructPointerEvent;
    'cancel': ConstructPointerEvent;
}> {
    private static isInited: boolean = false;

    static init(app: App<any>, pointer: C3ReactPointer) {
        if (this.isInited) return;

        app.on('pointerdown', (e) => {
            pointer.#isTouching = true;

            pointer.coordinates.set('start', {
                x: e.clientX,
                y: e.clientY
            });

            pointer.notifyListeners((event) => event.type === 'down');
            pointer.emit('down', e);
        });

        app.on('pointermove', (e) => {
            const [prevX, prevY] = pointer.getCoords('previous');

            if (prevX !== 0 && prevY !== 0) {
                const dx = e.clientX - prevX;
                const dy = e.clientY - prevY;

                pointer.#angleRadians = Math.atan2(dy, dx);         // Угол в радианах
                pointer.#angleDegrees = pointer.angleRadians * (180 / Math.PI); // В градусах
            }

            const [currentX, currentY] = pointer.getCoords('current');
            pointer.coordinates.set('previous', {
                x: currentX,
                y: currentY,
            });

            pointer.coordinates.set('current', {
                x: e.clientX,
                y: e.clientY,
            });

            pointer.emit('move', e);
        });

        app.on('pointerup', (e) => {
            pointer.#isTouching = false;
            pointer.coordinates.set('end', {
                x: e.clientX,
                y: e.clientY,
            });

            pointer.notifyListeners((event) => event.type === 'up');
            pointer.emit('up', e);
        });

        app.on('pointercancel', (e) => pointer.emit('cancel', e));
        app.on('afteranylayoutend', () => pointer.removeAllListeners());

        this.isInited = true;
    }

    private readonly coordinates = new Map<CoordinatesType, C3React.Position>();

    private readonly listeners = new Set<IC3ReactPointerEvent>();

    #isTouching: boolean = false;
    #angleRadians: number = 0;
    #angleDegrees: number = 0;

    public get angleRadians() {
        return this.#angleRadians;
    }

    public get angleDegrees() {
        return this.#angleDegrees;
    }

    constructor() {
        super();

        this.coordinates.set('start', { x: 0, y: 0 });
        this.coordinates.set('current', { x: 0, y: 0 });
        this.coordinates.set('previous', { x: 0, y: 0 });
        this.coordinates.set('end', { x: 0, y: 0 });
    }

    private notifyListeners(filter?: (event: IC3ReactPointerEvent) => boolean) {
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

    onDown(handler: () => void, opts?: Partial<{ once: boolean }>) {
        const unsubscribe = () => {
            this.listeners.delete(event);
        }

        const event: IC3ReactPointerEvent = {
            type: 'down',
            handler,
            unsubscribe,
            once: opts?.once || false,
        }

        this.listeners.add(event);

        return { unsubscribe };
    }

    onUp(handler: () => void, opts?: Partial<{ once: boolean }>) {
        const unsubscribe = () => {
            this.listeners.delete(event);
        }

        const event: IC3ReactPointerEvent = {
            type: 'up',
            handler,
            unsubscribe,
            once: opts?.once || false,
        }

        this.listeners.add(event);

        return { unsubscribe };
    }

    isTouching() {
        return this.#isTouching;
    }

    getCoords<T extends CoordinatesType>(type: T) {
        const { x, y } = this.coordinates.get(type)!;
        return [x, y] as const;
    }

    protected removeAllListeners() {
        super.release();
        this.listeners.clear();
    }
}

export const pointer = new C3ReactPointer();