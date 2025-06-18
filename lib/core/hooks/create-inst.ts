import type { ExtractObjectInstType } from '../component.ts';

export function createInst<N extends keyof IConstructProjectObjects>(
    objectName: N,
    opts?: Partial<{
        layerName: string,
        x: number,
        y: number,
        templateName: string,
        width: number,
        height: number,
    }>
) {
    const object = runtime.objects[objectName];
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