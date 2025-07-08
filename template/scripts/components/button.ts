import { Component, useChild, useTouched, utils } from 'c3react';
import gsap from 'gsap';

type Props = {
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
    onClicked?: (btn: Button) => void,
}

export default class Button extends Component<Props, 'button'> {
    private readonly getText = useChild(() => this.getRoot(), 'text');

    private initialSize: C3React.Size = {
        width: 0,
        height: 0,
    };

    constructor(id: string, props?: Partial<Props>) {
        super({
            animation: {
                ease: 'power4.out',
                duration: 0.2,
            },
            color: [255, 255, 255],
            reduceFactor: 1.1,

            ...props,
        },
            'button',
            (i) => i.instVars.id === id
        );

        this.onChanged('text', () => this.updateText());
        this.onChanged('color', () => this.updateColor());
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
                    const { onClicked } = this.getState();
                    this.animateOut();
                    onClicked?.(this);
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
        const { text } = this.getState();
        if (text) this.getText().text = text;
    }

    private updateColor() {
        const { color, animation } = this.getState();
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
        const { reduceFactor, animation } = this.getState();

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
        const { animation } = this.getState();

        gsap.to(this.getRoot(), {
            width,
            height,

            duration: animation.duration,
            ease: animation.ease,
            overwrite: true,
        });
    }
}