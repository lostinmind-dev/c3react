import type { ExtractObjectInstType } from '../component.ts';

export function useObject<N extends keyof IConstructProjectObjects>(
    name: N,
    pickBy?: (inst: ExtractObjectInstType<N>) => boolean,
) {
    let instance: ExtractObjectInstType<N> | undefined;

    const object = runtime.objects[name];

    if (pickBy) {
        //@ts-ignore;
        instance = object.instances().find((i) => condition(i));

        if (!instance) {
            throw new Error(
                `Instance [${name}] not found by condition`,
            );
        }

        return instance as ExtractObjectInstType<N>;
    }
    //@ts-ignore;
    instance = object.getFirstInstance() || undefined;

    if (!instance) throw new Error(`No any instance was found`);

    return instance;
}

export function useObjects<N extends keyof IConstructProjectObjects>(
    name: N,
    pickBy?: (inst: ExtractObjectInstType<N>) => boolean,
) {

    let instances: ExtractObjectInstType<N>[] = [];

    const object = runtime.objects[name];

    //@ts-ignore;
    instances = object.instances().filter((i) =>
        i.objectType.name === name
    ).toArray();

    if (pickBy) {
        instances = instances.filter((i) => pickBy(i));
    }

    return instances;
}
