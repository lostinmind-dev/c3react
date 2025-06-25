export function useEffect<N extends string>(
    instance: IWorldInstance | (() => IWorldInstance),
    effectName: N,
) {
    const inst = typeof instance === 'function'
        ? instance()
        : instance
    ;

    const effect = inst.effects.find(effect => effect.name === effectName);

    if (!effect) throw new Error(`Effect was not found with name [${effectName}]`)

    return effect as IEffectInstance & {
        readonly name: N;
    };
}