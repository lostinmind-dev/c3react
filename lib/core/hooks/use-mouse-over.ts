import { mouse } from '../inputs/mouse.ts';
import { isMouseOver } from '../utils.ts';

export function useMouseOver<I extends IWorldInstance>(
    instance: I | (() => I),
    handler: (type: 'in' | 'out') => void,
) {
    const inst = (typeof instance === 'function')
        ? instance()
        : instance
        ;

    let wasOver = false;

    const eventHandler = mouse.on('move', () => {
        const isOver = isMouseOver(inst);

        if (isOver && !wasOver) {
            wasOver = true;
            handler('in');
        } else if (!isOver && wasOver) {
            wasOver = false;
            handler('out');
        }
    });

    inst.addEventListener('destroy', () => eventHandler.unsubscribe());
}