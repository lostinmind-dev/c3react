import type { UseCondition } from "./index.ts";

export function useObject<
    ObjectName extends keyof IConstructProjectObjects,
    ChildInstType = NonNullable<ReturnType<IConstructProjectObjects[ObjectName]['getFirstInstance']>>
>(
    objectName: ObjectName,
    condition?: UseCondition<ChildInstType>,
) {
    let instances: IteratorObject<IWorldInstance, undefined, unknown>;
    
    return () => {
        const object = runtime.objects[objectName];

        instances = object.instances();

        if (condition) {
            const instance = instances.toArray().find(i => condition(i as ChildInstType));

            if (instance) return instance as ChildInstType;

            console.log(`Instance not found by condition [OBJECT_NAME: ${objectName}]`, condition)
            throw new Error(`Instance not found by condition [OBJECT_NAME: ${objectName}]`);
        }

        const instance = instances.find(i => i.objectType.name === objectName);

        if (!instance) throw new Error('Child not found');

        return instance as ChildInstType;
    }
}