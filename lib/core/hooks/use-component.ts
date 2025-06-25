import { Component } from '../component.ts';

export function useComponent<C extends Component>(pickBy: (component: C) => boolean) {
    return new Promise<C | null>((resolve) => {
        import('../component.ts').then(module => {
            const { components } = module;

            const component = components.toArray().find(c => pickBy(c as any));

            resolve((component as C) || null);
        })
    })
}