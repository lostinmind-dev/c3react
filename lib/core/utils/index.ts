import type { ExtractObjectInstType } from '../component.ts';

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

export function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function createObject<N extends keyof IConstructProjectObjects>(
    name: N,
    opts?: Partial<{
        layerName: string,
        x: number,
        y: number,
        templateName: string,
        width: number,
        height: number,
    }>
) {
    const object = runtime.objects[name];
    const instance = object.createInstance(
        opts?.layerName || 0,
        opts?.x || 0,
        opts?.y || 0,
        (opts?.templateName) ? true : false,
        opts?.templateName
    ) as ExtractObjectInstType<N>;

    if (opts?.width) instance.width = opts.width;
    if (opts?.height) instance.height = opts.height;

    return instance;
}

export function createObjects<N extends keyof IConstructProjectObjects>(
    name: N,
    ...objects: Partial<{
        layerName: string,
        x: number,
        y: number,
        templateName: string,
        width: number,
        height: number,
    }>[]
) {
    const instances: ExtractObjectInstType<N>[] = [];

    for (const opts of objects) {
        instances.push(createObject(name, opts));
    }

    return instances;
}