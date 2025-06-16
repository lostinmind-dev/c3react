import type { ExtractObjectInstType } from '../component.ts';

export function useInst<N extends keyof IConstructProjectObjects>(
    objectName: N,
    condition?: (inst: ExtractObjectInstType<N>) => boolean,
) {
    let instance: ExtractObjectInstType<N> | undefined;

    return () => {
        const object = runtime.objects[objectName];

        if (condition) {
            //@ts-ignore;
            instance = object.instances().find((i) => condition(i));

            if (!instance) {
                throw new Error(
                    `Instance [${objectName}] not found by condition`,
                );
            }

            return instance as ExtractObjectInstType<N>;
        }
        //@ts-ignore;
        instance = object.getFirstInstance() || undefined;

        if (!instance) throw new Error(`No any instance was found`);

        return instance;
    };
}
