type LayoutOpts = Partial<{
    beforeStart: (layout: IAnyProjectLayout) => void,
    onStart: (layout: IAnyProjectLayout) => void,
    beforeEnd: (layout: IAnyProjectLayout) => void,
    onEnd: (layout: IAnyProjectLayout) => void,
}>


class Layout<N extends string = string> {
    constructor(readonly name: N, readonly opts: LayoutOpts) {

    }
}

export function useLayout<N extends string>(name: N, opts: LayoutOpts) {
    return new Layout(name, opts);
}