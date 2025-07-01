export type Layout = {
    onStart?: () => void | Promise<void>,
    onBeforeEnd?: () => void | Promise<void>,
    onEnd?: () => void | Promise<void>,
};

type LayoutComponent = (layout: IAnyProjectLayout) => Layout;

let isInited = false;

class App {
    init(opts: {
        inputs?: ('keyboard' | 'mouse' | 'pointer')[],
        layouts: Layout[] | readonly Layout[],
        beforeStart: () => void | Promise<void>,
    }) {

        runOnStartup(async (runtime) => {
            isInited = true;

            //@ts-ignore @GLOBAL
            globalThis.runtime = runtime;
            
            await opts.beforeStart?.();
        });
    }
}

export const app = new App();