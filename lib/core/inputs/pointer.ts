import { app } from '../app.ts';
import { EventsHandler } from '../events-handler.ts';

export class C3ReactPointer extends EventsHandler<{
    'down': ConstructPointerEvent;
    'move': ConstructPointerEvent;
    'up': ConstructPointerEvent;
    'cancel': ConstructPointerEvent;
}> {
    private isInited: boolean = false;

    private readonly coordinates = {
        start: { x: 0, y: 0 },
        current: { x: 0, y: 0 },
        previous: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
    } satisfies Record<'start' | 'current' | 'previous' | 'end', C3React.Position>;

    public init() {
        if (this.isInited) return;

        app.on('pointerdown', (e) => {
            this.coordinates.start = {
                x: e.clientX,
                y: e.clientY
            };

            this.emit('down', e);
        });

        app.on('pointermove', (e) => {
            this.coordinates.previous = {
                x: this.coordinates.current.x,
                y: this.coordinates.current.y,
            };

            this.coordinates.current = {
                x: e.clientX,
                y: e.clientY,
            };

            this.emit('move', e);
        });

        app.on('pointerup', (e) => {
            this.coordinates.end = {
                x: e.clientX,
                y: e.clientY,
            };

            this.emit('up', e);
        });

        app.on('pointercancel', (e) => this.emit('cancel', e));
        app.on('afteranylayoutend', () => this.release());

        this.isInited = true;
    }

    getCoords<T extends keyof typeof this.coordinates>(type: T) {
        return this.coordinates[type];
    }
}

export const pointer = new C3ReactPointer();