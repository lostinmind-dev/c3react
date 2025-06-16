import type { ExtractObjectInstType } from '../component-v2.ts';

export function useInsts<N extends keyof IConstructProjectObjects>(
    objectName: N,
    condition?: (inst: ExtractObjectInstType<N>) => boolean,
) {
    let instances: ExtractObjectInstType<N>[] = [];

    return () => {
        const object = runtime.objects[objectName];

        instances = object.instances().filter((i) =>
            i.objectType.name === objectName
        ).toArray();

        if (condition) {
            instances = instances.filter((i) => condition(i));
        }

        return instances;
    };
}
