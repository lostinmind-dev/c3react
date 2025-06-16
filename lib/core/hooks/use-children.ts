import type { ExtractObjectInstType } from '../component.ts';

export function useChildren<
    N extends keyof IConstructProjectObjects,
    I = ExtractObjectInstType<N>,
>(
    instance: IWorldInstance | (() => IWorldInstance),
    objectName: N,
    condition?: (inst: I) => boolean,
) {
    let children: I[] = [];

    return () => {
        if (typeof instance === 'function') {
            children = instance().allChildren().filter((i) =>
                i.objectType.name === objectName
            ).toArray() as I[];
        } else {
            children = instance.allChildren().filter((i) =>
                i.objectType.name === objectName
            ).toArray() as I[];
        }

        if (condition) {
            children = children.filter((i) => condition(i));

            return children;
        }

        return children;
    };
}
