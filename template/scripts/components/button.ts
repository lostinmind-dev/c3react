import { Component, useChild, useTouched, utils, ExtractStateType } from 'c3react';
import gsap from 'gsap';

const DEFAULT_COLOR: Vec3Arr = [255, 255, 255];
const DEFAULT_ANIMATION: ExtractStateType<Button>['animation'] = {
    ease: 'power4.out',
    duration: 0.2
};
const DEFAULT_REDUCE_FACTOR: number = 1.1;

export default class Button extends Component<'button', {
    animation: {
        /** @default 'power4.out' */
        ease: gsap.EaseString,
        /** @default 0.2 */
        duration: number,
    },
    /** @default 'empty' */
    text?: string,
    /** @default [255, 255, 255] */
    color: Vec3Arr,
    /** @default 1.1 */
    reduceFactor: number,
}> {
    // protected isCached: boolean = true;

    private readonly getText = useChild(() => this.getRoot(), 'text');

    onClicked?: (btn: Button) => void;

    private initialSize: C3React.Size = {
        width: 0,
        height: 0,
    };

    constructor(id: string, props?: Partial<ExtractStateType<Button>>) {
        super({
            objectName: 'button',

            state: {
                animation: DEFAULT_ANIMATION,
                color: DEFAULT_COLOR,
                reduceFactor: DEFAULT_REDUCE_FACTOR,

                ...props,
            },
            pickBy: (i) => i.instVars.id === id
        });

        this.state.onChanged('text', () => this.updateText());
        this.state.onChanged('color', () => this.updateColor());
    }

    protected onReady() {
        const { width, height } = this.getRoot();
        this.initialSize = { width, height };

        this.updateText();
        this.updateColor();
        
        useTouched(() => this.getRoot(), (type) => {
            switch (type) {
                case 'start': { this.animateIn(); } break;
                case 'end': {
                    this.animateOut();
                    this.onClicked?.(this);
                } break;
            }
        });
    }

    protected onDestroyed() {
        try {
            const root = this.getRoot();
            gsap.killTweensOf(root);
        } catch (e) { }
    }

    private updateText() {
        const { text } = this.state.get();
        if (text) this.getText().text = text;
    }

    private updateColor() {
        const { color, animation } = this.state.get();
        if (!color) return;

        const root = this.getRoot();

        const [r, g, b] = root.colorRgb;
        const rgb = utils.rgbToVec3(color);

        const $ = { r, g, b };
        gsap.to($, {
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],

            duration: animation.duration,
            ease: animation.ease,
            overwrite: true,
            onUpdate: () => { root.colorRgb = [$.r, $.g, $.b] }
        });
    }

    private animateIn() {
        const { width, height } = this.initialSize;
        const { reduceFactor, animation } = this.state.get();

        gsap.to(this.getRoot(), {
            width: width / reduceFactor,
            height: height / reduceFactor,

            duration: animation.duration,
            ease: animation.ease,
            overwrite: true,
        });
    }

    private animateOut() {
        const { width, height } = this.initialSize;
        const { animation } = this.state.get();

        gsap.to(this.getRoot(), {
            width,
            height,

            duration: animation.duration,
            ease: animation.ease,
            overwrite: true,
        });
    }
}