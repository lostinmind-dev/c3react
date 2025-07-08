import { type Component, components } from '../component.ts';

export function useComponent<T extends Component<any, any>>(
    componentClass: new (...args: any[]) => T,
    pickBy?: (component: InstanceType<typeof componentClass>) => boolean,
) {
    let component: InstanceType<typeof componentClass>;

    return () => {
        if (pickBy) {
            //@ts-ignore;
            component = components.toArray().find(c => pickBy(c))
        } else {
            //@ts-ignore;
            component = components.toArray().find(c => c.constructor.name === componentKlass.name);
        }

        return component as InstanceType<typeof componentClass>;
    }
}