import { Collection } from '../collection.ts';
import { mouse } from '../inputs/mouse.ts';
import { isCoordsOverBBox } from './use-touched.ts';

function checkOver<I extends IWorldInstance>(instance: I) {
    const layer = instance.layer;
    if (!layer.isInteractive) return false;

    const [x, y] = mouse.getCoords('current');
    const [translatedX, translatedY] = layer.cssPxToLayer(x, y);

    return isCoordsOverBBox(
        instance.getBoundingBox(),
        translatedX,
        translatedY,
    );
}

const cached = new Collection<IWorldInstance>();
export function useMouseOver<I extends IWorldInstance>(
    instance: I | (() => I),
    handler: (type: 'over' | 'out') => void,
) {
    if (typeof instance === 'function') instance = instance();

    mouse.on('move', () => {
        if (!cached.has(instance) && checkOver(instance)) {
            cached.add(instance);
            return handler('over');
        }

        cached.delete(instance);
        handler('out');
    });
}
