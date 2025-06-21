import { app } from './app.ts';
import { pointer } from './inputs/pointer.ts';

type ExtractObjectInstType<N extends keyof IConstructProjectObjects> =
    NonNullable<
        ReturnType<
            IConstructProjectObjects[N]['getFirstInstance']
        >
    >
    ;

type LayoutOpts = Partial<{
    beforeStart: (layout: IAnyProjectLayout) => void,
    onStart: (layout: IAnyProjectLayout) => void,
    beforeEnd: (layout: IAnyProjectLayout) => void,
    onEnd: (layout: IAnyProjectLayout) => void,
}>


class Layout {
    constructor(readonly name: string, readonly opts: LayoutOpts) {

    }
}

function useLayout(name: string, opts: LayoutOpts) {
    return new Layout(name, opts);
}

function useObject<N extends keyof IConstructProjectObjects>(name: N, pickBy?: (instance: ExtractObjectInstType<N>) => boolean) {
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

export default useLayout('main', {
    onStart: () => {
        const c3react = useObject('c3react');
        const button = useObject('button');

        pointer.onTouched(button, (type) => {
            switch (type) {
                case 'start': { c3react.setSize(128, 128) } break;
                case 'end': { c3react.setSize(256, 256) } break;
            }
        });
    },
});