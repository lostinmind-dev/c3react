
import { pointer } from '../inputs/pointer.ts';
import { isPointerOver } from '../utils/index.ts';

export function useTouched<I extends IWorldInstance>(
    instance: I | (() => I),
    handler: (type: 'start' | 'end') => void,
) {
    const inst = (typeof instance === 'function')
        ? instance()
        : instance
    ;

    const eventHandlers = [
        pointer.on('down', () => {
            if (isPointerOver(inst)) handler('start');
        }),
    
        pointer.on('up', () => {
            if (isPointerOver(inst)) handler('end');
        }),
    ];
    
    inst.addEventListener('destroy', () => {
        eventHandlers.forEach(handler => handler.unsubscribe());
    });
}