import type { UseCondition } from "./index.ts";

export function useChild<
    ObjectName extends keyof IConstructProjectObjects,
    ChildInstType = NonNullable<ReturnType<IConstructProjectObjects[ObjectName]['getFirstInstance']>>
>(
    container: () => InstanceType.container,
    objectName: ObjectName,
    condition?: UseCondition<ChildInstType>,
    type: 'own' | 'all' = 'all',
) {
    let children: IteratorObject<IWorldInstance, undefined, unknown>;
    
    return () => {
        if (type === 'all') {
            children = container().allChildren().filter(i => i.objectType.name === objectName);
        } else {
            children = container().children().filter(i => i.objectType.name === objectName);
        }

        if (condition) {
            const child = children.toArray().find(i => condition(i as ChildInstType));

            if (child) return child as ChildInstType;

            console.log(`Child not found by condition [OBJECT_NAME: ${objectName}]`, condition)
            throw new Error(`Child not found by condition [OBJECT_NAME: ${objectName}]`);
        }

        const child = children.find(i => i.objectType.name === objectName);

        if (!child) throw new Error('Child not found');

        return child as ChildInstType;
    }
}