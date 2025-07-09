import type { ExtractInstanceType } from '../component.ts';
import { mouse } from '../inputs/mouse.ts';
import { pointer } from '../inputs/pointer.ts';

export function wait(seconds: number) {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), seconds * 1000));
}

export function choose(...numbers: number[]) {
    const index = Math.floor(Math.random() * numbers.length);
    return numbers[index];
}

export function rgbToVec3(rgb: Vec3Arr) {
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255] as Vec3Arr satisfies Vec3Arr;
}

export function lerp(a: number, b: number, c: number) {
    return (a + (b - a) * c);
}

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function random2(range: [number, number], range2: [number, number] = range): [number, number] {
    const [min1, max1] = range;
    const [min2, max2] = range2;

    return [random(min1, max1), random(min2, max2)];
}

export function random3(range: [number, number], range2: [number, number] = range, range3: [number, number] = range2): [number, number, number] {
    const [min1, max1] = range;
    const [min2, max2] = range2;
    const [min3, max3] = range3;

    return [random(min1, max1), random(min2, max2), random(min3, max3)];
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function isInPreview() {
    return runtime.platformInfo.exportType === 'preview';
}

type CreateObjectOpts<I extends { instVars: Record<string, any> }> = {
    layerName: string,
    x: number,
    y: number,
    templateName: string,
    width: number,
    height: number,
    opacity: number,
    angle: number,
    instVars?: Partial<I['instVars']>,
}

export function createObject<N extends keyof IConstructProjectObjects>(
    name: N,
    opts?: Partial<CreateObjectOpts<ExtractInstanceType<N>>>
) {
    const object = runtime.objects[name];

    const instance = object.createInstance(
        opts?.layerName || 0,
        opts?.x || 0,
        opts?.y || 0,
        (opts?.templateName) ? true : false,
        opts?.templateName
    ) as ExtractInstanceType<N>;

    if (typeof opts?.width !== 'undefined') instance.width = opts.width;
    if (typeof opts?.height !== 'undefined') instance.height = opts.height;
    if (typeof opts?.opacity !== 'undefined') instance.opacity = opts.opacity;
    if (typeof opts?.angle !== 'undefined') instance.angleDegrees = opts.angle;
    if ('instVars' in instance && typeof opts?.instVars === 'object') {
        for (const name in opts.instVars) {
            instance.instVars[name] = opts.instVars[name];
        }
    } 
    return instance;
}

export function createObjects<N extends keyof IConstructProjectObjects>(
    name: N,
    ...objects: Partial<CreateObjectOpts<ExtractInstanceType<N>>>[]
) {
    const instances: ExtractInstanceType<N>[] = [];

    for (const opts of objects) {
        instances.push(createObject(name, opts));
    }

    return instances;
}

export function isCoordsOverBBox(bbox: DOMRect, x: number, y: number) {
    return (
        x > bbox.left &&
        x < bbox.right &&
        y > bbox.top &&
        y < bbox.bottom
    );
}

export function isMouseOver(instance: IWorldInstance) {
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

export function isPointerOver(instance: IWorldInstance) {
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

export async function addScript(url: string, opts?: {
    async?: true,
    module?: true,
}) {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;

        script.onload = () => resolve();
        script.onerror = reject;

        if (opts?.async) script.async = true;
        if (opts?.module) script.type = 'module';

        document.head.appendChild(script);
    });
}