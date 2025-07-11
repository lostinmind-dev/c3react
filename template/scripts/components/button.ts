import { utils, ExtractComponentStateType } from 'c3react';
import { C3ReactButton } from 'c3react/components';

import gsap from 'gsap';

const DEFAULT_COLOR: Vec3Arr = [255, 255, 255];
const DEFAULT_ANIMATION: ExtractComponentStateType<Button>['animation'] = {
    ease: 'power4.out',
    duration: 0.2
};
const DEFAULT_REDUCE_FACTOR: number = 1.1;

export default class Button extends C3ReactButton<{
    animation: {
        /** @default 'power4.out' */
        ease: gsap.EaseString,
        /** @default 0.2 */
        duration: number,
    },
    /** @default [255, 255, 255] */
    color: Vec3Arr,
    /** @default 1.1 */
    reduceFactor: number,
}> {
    constructor(tag: string, state?: Partial<ExtractComponentStateType<Button> & ExtractComponentStateType<C3ReactButton>>) {
        super(tag, {
            animation: DEFAULT_ANIMATION,
            color: DEFAULT_COLOR,
            reduceFactor: DEFAULT_REDUCE_FACTOR,
            
            ...state,
        });

        this.state.onChanged('color', () => this.updateColor());

        this.setAnimation({
            in: async () => {
                const { reduceFactor, animation } = this.state.get();

                return await new Promise<void>((resolve) => {
                    gsap.to(this.getRoot(), {
                        width: this.initialWidth / reduceFactor,
                        height: this.initialHeight / reduceFactor,

                        duration: animation.duration,
                        ease: animation.ease,
                        overwrite: true,
                        onComplete: () => resolve(),
                    });
                })
            },
            out: async () => {
                const { animation } = this.state.get();

                return await new Promise<boolean>((resolve) => {
                    gsap.to(this.getRoot(), {
                        width: this.initialWidth,
                        height: this.initialHeight,

                        duration: animation.duration,
                        ease: animation.ease,
                        overwrite: true,

                        onStart: () => resolve(true),
                        onComplete: () => resolve(false),
                    })
                })
            },
        })
    }

    protected onReady() {
        super.onReady();
        this.updateColor();
    }

    protected onDestroyed() {
        try {
            const root = this.getRoot();
            gsap.killTweensOf(root);
        } catch (e) { }

        super.onDestroyed();
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
}