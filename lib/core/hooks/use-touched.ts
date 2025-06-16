function isCoordsOverBBox(bbox: DOMRect, x: number, y: number) {
    return (
        x > bbox.left &&
        x < bbox.right &&
        y > bbox.top &&
        y < bbox.bottom
    );
}

function checkTouched<I extends IWorldInstance>(instance: I) {
    const layer = instance.layer;
    if (!layer.isInteractive) return false;

    const { x, y } = pointer.current;
    const [translatedX, translatedY] = layer.cssPxToLayer(x, y);

    return isCoordsOverBBox(
        instance.getBoundingBox(),
        translatedX,
        translatedY,
    );
}

export function useTouched<I extends IWorldInstance>(
    instance: I | (() => I),
    handler: (type: 'start' | 'end') => void,
) {
    if (typeof instance === 'function') instance = instance();

    pointer.onDown(() => {
        if (checkTouched(instance)) handler('start');
    });

    pointer.onUp(() => {
        if (checkTouched(instance)) handler('end');
    });
}
