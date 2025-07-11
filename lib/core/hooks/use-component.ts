import { type Component, components, type ExtractObjectName, type ExtractStateType } from '../component.ts';
import { createObject } from '../utils.ts';

export function useComponent<T extends Component<any, any>>(
    componentClass: new (...args: any[]) => T
) {
    let component: InstanceType<typeof componentClass>;

    const get = (pickBy?: (component: InstanceType<typeof componentClass>) => boolean) => {
        if (pickBy) {
            //@ts-ignore;
            component = components.toArray().find(c => pickBy(c))
        } else {
            //@ts-ignore;
            component = components.toArray().find(c => c.constructor.name === componentKlass.name);
        }

        return component as InstanceType<typeof componentClass>;
    }

    const create = <N extends ExtractObjectName<T>>(
        objectName: N,
        opts?: Parameters<typeof createObject<N>>[1],
        state?: ExtractStateType<T> | ((prevState: ExtractStateType<T>) => ExtractStateType<T>)
    ) => {
        const root = createObject(objectName, opts);

        component = new componentClass();
        //@ts-ignore;
        component.root = root;

        if (state) component.state.set(state);
        //@ts-ignore;
        component.onReady();

        return component;
    }

    return [create, get] as const;
}
