import { type Layout, layouts } from '../layout.ts';

export function useLayout<T extends Layout>(layoutClass: new () => T) {
    const layout = layouts.toArray().find(layout => layout.constructor.name === layoutClass.name)
    if (!layout) throw new Error('Layout was not found!');
    return layout as InstanceType<typeof layoutClass>;
}