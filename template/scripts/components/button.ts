import { Component, useChild, useTouched, utils } from 'c3react';
import gsap from 'gsap';

export default class Button extends Component<{
    label: string,
    onClicked?: (btn: Button) => void,
    color: Vec3Arr,
    reduceFactor: number,
}, 'button'> {
    private readonly getLabel = useChild(() => this.getRoot(), 'text');

    private initialSize: C3React.Size = {
        width: 0,
        height: 0,
    };

    constructor(id: string, label: string, onClicked?: (btn: Button) => void) {
        super({
            label,
            color: [148, 169, 184],
            onClicked,
            reduceFactor: 1.1,
        },
            'button',
            (i) => i.instVars.id === id
        );

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

        this.onChanged('label', () => this.updateText());
        this.onChanged('color', () => this.updateColor());
    }

    protected onReady() {
        const { width, height } = this.getRoot();
        this.initialSize = { width, height };

        this.updateText();
        this.updateColor();
    }

    private updateText() {
        const { label } = this.getState();
        this.getLabel().text = label;
    }

    private updateColor() {
        const { color } = this.getState();
        const root = this.getRoot();

        const [r, g, b] = root.colorRgb;
        const rgb = utils.rgbToVec3(color);

        const $ = { r, g, b };
        gsap.to($, {
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],

            duration: 1,
            ease: 'power4.out',
            overwrite: true,
            onUpdate: () => { root.colorRgb = [$.r, $.g, $.b] }
        });
    }

    private animateIn() {
        const { width, height } = this.initialSize;
        const { reduceFactor } = this.getState();

        gsap.to(this.getRoot(), {
            width: width / reduceFactor,
            height: height / reduceFactor,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }

    private animateOut() {
        const { width, height } = this.initialSize;

        gsap.to(this.getRoot(), {
            width,
            height,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }
}