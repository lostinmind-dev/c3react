
import { pointer } from '../inputs/pointer.ts';
import { isPointerOver } from '../utils.ts';

export function useTouched<I extends IWorldInstance>(
    instance: I | (() => I),
    handler: (type: 'start' | 'end') => void,
) {
    const inst = (typeof instance === 'function')
        ? instance()
        : instance
        ;

    const events = [
        pointer.on('down', () => {
            if (isPointerOver(inst)) handler('start');
        }),

        pointer.on('up', () => {
            if (isPointerOver(inst)) handler('end');
        }),
    ];

    inst.addEventListener('destroy', () => events.forEach(event => event.unsubscribe()));

    return {
        unsubscribe: () => {
            events.forEach(event => event.unsubscribe());
        }
    };
}