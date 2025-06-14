import type { UseCondition } from "./index.ts";

export function useChildren<
    ObjectName extends keyof IConstructProjectObjects,
    ChildInstType = NonNullable<ReturnType<IConstructProjectObjects[ObjectName]['getFirstInstance']>>
>(
    container: InstanceType.container,
    objectName: ObjectName,
    type: 'own' | 'all' = 'all',
    condition?: UseCondition<ChildInstType>
) {
    let children: IteratorObject<IWorldInstance, undefined, unknown>;

    return () => {
        if (type === 'all') {
            children = container.allChildren().filter(i => i.objectType.name === objectName);
        } else {
            children = container.children().filter(i => i.objectType.name === objectName);
        }

        if (condition) {
            const filtered = children.filter(i => condition(i as ChildInstType));

            return filtered.toArray() as ChildInstType[];
        }

        return children.toArray() as ChildInstType[];
    }
}