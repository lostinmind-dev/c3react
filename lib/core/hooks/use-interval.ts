import { App } from '../app.ts';
import { EventsHandler, type Handler } from '../utils/events-handler.ts';

class Interval extends EventsHandler<{
    'end': void,
}> {
    private lastTime = performance.now();
    private elapsed = 0;
    private iterations: number = 0;
    isRunning: boolean = true;

    constructor(private readonly seconds: number, private readonly handler: Handler<number>, private maxIterations = Infinity) {
        super();
        requestAnimationFrame(this.loop.bind(this))
    }

    private loop(time: number) {

        if (!this.isRunning) return;

        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.elapsed += dt;

        if (this.elapsed >= this.seconds) {
            this.elapsed -= this.seconds;
            this.handler(this.iterations);
            this.iterations++;

            if (this.iterations >= this.maxIterations) {
                this.isRunning = false;
                this.emit('end');
                return;
            }
        }

        requestAnimationFrame(this.loop.bind(this));
    }
}

const intervals = new Set<Interval>();

export function useInterval(seconds: number, handler: Handler<number>, opts?: Partial<{ iterations: number, cached: boolean }>) {
    const interval = new Interval(seconds, handler, opts?.iterations);

    const clear = () => {
        stop();
        intervals.delete(interval);
    }

    const stop = () => {
        interval.isRunning = false;
    }

    const resume = () => {
        interval.isRunning = true;
    }

    interval.on('end', () => clear())

    intervals.add(interval);

    if (opts?.cached === true) {
        const app = App.instance;

        app.on('afteranylayoutend', () => clear(), { once: true });
    }

    return { clear, stop, resume };
}