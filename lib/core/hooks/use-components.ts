import type { ComponentConstructor } from "./index.ts";
import { Component } from "../component.ts";

export function useComponents<T extends Component, Ids extends string[]>(
    componentClass: ComponentConstructor<T>,
    ids: Ids,
) {
    const collection = new Map<Ids[number], T>();

    return (props: Record<Ids[number], T['useProps']>) => {
        const components = Array.from(Component.components.values().filter(c => ids.includes(c.id))) as T[] satisfies T[];

        const containers = runtime.objects.container.instances().filter(i => ids.includes(i.instVars.id));
        for (const container of containers) {
            const useProps = props[container.instVars.id as Ids[number]]

            const component = new componentClass(container.instVars.id, useProps);
            Component.ready(component, container);
            components.push(component);
        }

        components.forEach(component => collection.set(component.id, component));

        return collection;
    }
}