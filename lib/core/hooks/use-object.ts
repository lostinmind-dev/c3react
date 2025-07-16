import type { ExtractInstanceType } from '../component.ts';

export function useObject<N extends keyof IConstructProjectObjects>(
    name: N,
    pickBy?: (inst: ExtractInstanceType<N>) => boolean,
) {
    let instance: ExtractInstanceType<N> | undefined;

    const object = runtime.objects[name];

    if (pickBy) {
        //@ts-ignore;
        instance = object.getAllInstances().find((i) => pickBy(i));

        if (!instance) {
            throw new Error(
                `Instance [${name}] not found by condition`,
            );
        }

        return instance as ExtractInstanceType<N>;
    }
    //@ts-ignore;
    instance = object.getFirstInstance() || undefined;

    if (!instance) throw new Error(`No any instance was found`);

    return instance;
}

export function useObjects<N extends keyof IConstructProjectObjects>(
    name: N,
    pickBy?: (inst: ExtractInstanceType<N>) => boolean,
) {

    let instances: ExtractInstanceType<N>[] = [];

    const object = runtime.objects[name];

    //@ts-ignore;
    instances = object.getAllInstances().filter((i) =>
        i.objectType.name === name
    );

    if (pickBy) {
        instances = instances.filter((i) => pickBy(i));
    }

    return instances;
}
