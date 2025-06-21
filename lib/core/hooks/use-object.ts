import { ExtractObjectInstType } from '../component.ts';

export function useObject<N extends keyof IConstructProjectObjects>(name: N, pickBy?: (instance: ExtractObjectInstType<N>) => boolean) {
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