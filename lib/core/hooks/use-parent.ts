import type { ExtractObjectInstType } from '../component.ts';

export function useParent<
    N extends keyof IConstructProjectObjects,
    I = ExtractObjectInstType<N>,
>(
    instance: IWorldInstance | (() => IWorldInstance),
    objectName: N,
) {
    return () => {
        const inst = typeof instance === 'function'
            ? instance()
            : instance
        ;

        const parent = inst.getParent();

        if (!parent) throw new Error(`Instance hasn't parent!`);
        if (parent.objectType.name !== objectName) throw new Error(`Parent is [${parent.objectType.name} object type, but not [${objectName}]`);
        
        return inst.getParent() as I;
    }
}