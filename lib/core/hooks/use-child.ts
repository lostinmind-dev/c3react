import type { ExtractInstanceType } from '../component.ts';

/**
 * Searching child in instance by proving "objectName" and optional "condition" parameters
 * @param instance Instance or callback with instance that will be used for searching child for
 * @param objectName Object name of child
 * @param condition *Optional* condition for searching
 * @returns
 */
export function useChild<
    N extends keyof IConstructProjectObjects,
    I = ExtractInstanceType<N>,
>(
    instance: IWorldInstance | (() => IWorldInstance),
    objectName: N,
    pickBy?: (inst: I) => boolean,
) {
    let children: I[];
    let child: I | undefined;

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

        if (pickBy) {
            child = children.find((i) => pickBy(i));

            if (!child) throw new Error('Child NOT found by condition');

            return child;
        }

        if (children.length === 0) throw new Error('0 children was found');

        child = children[0];

        return child;
    };
}


export function useChildren<
    N extends keyof IConstructProjectObjects,
    I = ExtractInstanceType<N>,
>(
    instance: IWorldInstance | (() => IWorldInstance),
    objectName: N,
    pickBy?: (inst: I) => boolean,
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

        if (pickBy) {
            children = children.filter((i) => pickBy(i));

            return children;
        }

        return children;
    };
}