import type { Layout } from '../layout.ts';
import { App, app } from '../app.ts';

export function useLayout<T extends Layout>(layoutClass: new () => T) {
    const layout = App.getLayout(app, layoutClass);
    return layout;
}