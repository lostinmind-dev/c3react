import { app } from '../app.ts';
import { EventsHandler } from '../utils/events-handler.ts';

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

    public init() {
        if (this.isInited) return;

        app.on('pointerdown', (e) => {
            this.#isTouching = true;

            this.coordinates.start = {
                x: e.clientX,
                y: e.clientY
            };

            this.emit('down', e);
        });

        app.on('pointermove', (e) => {
            const [prevX, prevY] = this.getCoords('previous');

            if (prevX !== 0 && prevY !== 0) {
                const dx = e.clientX - prevX;
                const dy = e.clientY - prevY;

                this.#angleRadians = Math.atan2(dy, dx);         // Угол в радианах
                this.#angleDegrees = this.angleRadians * (180 / Math.PI); // В градусах
            }

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
            this.#isTouching = false;
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

    onTouched<I extends IWorldInstance>(instance: I, handler: (type: 'start' | 'end') => void) {
        const isCoordsOverBBox = (bbox: DOMRect, x: number, y: number) => {
            return (
                x > bbox.left &&
                x < bbox.right &&
                y > bbox.top &&
                y < bbox.bottom
            );
        }
        const checkTouched = <I extends IWorldInstance>(instance: I) => {
            const layer = instance.layer;
            if (!layer.isInteractive) return false;

            const [x, y] = pointer.getCoords('current');
            const [translatedX, translatedY] = layer.cssPxToLayer(x, y);

            return isCoordsOverBBox(
                instance.getBoundingBox(),
                translatedX,
                translatedY,
            );
        }

        this.on('down', () => {
            if (checkTouched(instance)) handler('start');
        });

        this.on('up', () => {
            if (checkTouched(instance)) handler('end');
        });
    }

    getCoords<T extends keyof typeof this.coordinates>(type: T) {
        const { x, y } = this.coordinates[type];
        return [x, y] as const;
    }
}

export const pointer = new C3ReactPointer();