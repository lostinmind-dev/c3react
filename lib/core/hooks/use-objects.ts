import type { UseCondition } from "./index.ts";

export function useObjects<
    ObjectName extends keyof IConstructProjectObjects,
    ChildInstType = NonNullable<ReturnType<IConstructProjectObjects[ObjectName]['getFirstInstance']>>
>(
    objectName: ObjectName,
    condition?: UseCondition<ChildInstType>
) {
    let instances: IteratorObject<IWorldInstance, undefined, unknown>;

    return () => {
        const object = runtime.objects[objectName];

        instances = object.instances(); 

        if (condition) {
            const filtered = instances.filter(i => condition(i as ChildInstType));

            return filtered.toArray() as ChildInstType[];
        }

        return instances.toArray() as ChildInstType[];
    }
}