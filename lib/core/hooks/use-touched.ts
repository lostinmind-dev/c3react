
import { pointer } from '../inputs/pointer.ts';
import { checkTouched } from '../utils/index.ts';

export function useTouched<I extends IWorldInstance>(
    instance: I | (() => I),
    handler: (type: 'start' | 'end') => void,
) {
    const inst = (typeof instance === 'function')
        ? instance()
        : instance
    ;

    const subscribers = [
        pointer.on('down', () => {
            if (checkTouched(inst)) handler('start');
        }),
    
        pointer.on('up', () => {
            if (checkTouched(inst)) handler('end');
        }),
    ]

    inst.addEventListener('destroy', () => {
        subscribers.forEach(unsubscribe => unsubscribe());
    })
}