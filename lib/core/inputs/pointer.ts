import { app } from '../app.ts';
import { EventsHandler } from '../utils/events-handler.ts';

export class C3ReactPointer extends EventsHandler<{
    'down': ConstructPointerEvent;
    'move': ConstructPointerEvent;
    'up': ConstructPointerEvent;
    'cancel': ConstructPointerEvent;
}> {
    private static isInited: boolean = false;

    static init(pointer: C3ReactPointer) {
        if (this.isInited) return;

        app.on('pointerdown', (e) => {
            pointer.#isTouching = true;

            pointer.coordinates.start = {
                x: e.clientX,
                y: e.clientY
            };

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

            pointer.coordinates.previous = {
                x: pointer.coordinates.current.x,
                y: pointer.coordinates.current.y,
            };

            pointer.coordinates.current = {
                x: e.clientX,
                y: e.clientY,
            };

            pointer.emit('move', e);
        });

        app.on('pointerup', (e) => {
            pointer.#isTouching = false;
            pointer.coordinates.end = {
                x: e.clientX,
                y: e.clientY,
            };

            pointer.emit('up', e);
        });

        app.on('pointercancel', (e) => pointer.emit('cancel', e));
        app.on('afteranylayoutend', () => pointer.release());

        this.isInited = true;
    }

    private readonly coordinates = {
        start: { x: 0, y: 0 },
        current: { x: 0, y: 0 },
        previous: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
    } satisfies Record<'start' | 'current' | 'previous' | 'end', C3React.Position>;

    #isTouching: boolean = false;
    #angleRadians: number = 0;
    #angleDegrees: number = 0;

    public get isTouching() {
        return this.#isTouching;
    }

    public get angleRadians() {
        return this.#angleRadians;
    }

    public get angleDegrees() {
        return this.#angleDegrees;
    }

    getCoords<T extends keyof typeof this.coordinates>(type: T) {
        const { x, y } = this.coordinates[type];
        return [x, y] as const;
    }
}

export const pointer = new C3ReactPointer();