import type { ComponentConstructor } from "./index.ts";
import { Component } from "../component.ts";

export function useComponent<T extends Component>(
    componentClass: ComponentConstructor<T>,
    id: string,
) {
    return (useProps?: T['useProps']) => {
        if (Component.components.values().find(c => c.id === id)) return Array.from(Component.components).find(c => c.id === id) as T;

        const container = runtime.objects.container.instances().find(i => i.instVars.id === id);
        if (!container) throw new Error(`Container not found [ID: ${id}]`);
        // if (!useProps) throw new Error('"useProps" must be provided OR "null"');

        const component = new componentClass(id, useProps);
        Component.ready(component, container);
        return component;
    }
}