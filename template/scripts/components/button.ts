import { Component, useChild, useTouched, utils } from 'c3react';
import gsap from 'gsap';

export default class Button extends Component<{
    onClicked?: () => void,
    label: string,
    color: Vec3Arr,
}, 'button'> {
    private readonly useLabel = useChild(() => this.getRoot(), 'text');

    private initialSize: C3React.Size = {
        width: 0,
        height: 0,
    };

    constructor(id: 'c3react') {
        super(
            { color: [0, 225, 199], label: 'C3React' },
            'button',
            (i) => i.instVars.id === id
        );
    }

    protected override onReady(): void {
        const { label, color } = this.getState();
        const { width, height } = this.getRoot();
        this.initialSize = { width, height };

        this.useLabel().text = label;
        this.changeColor(color);

        useTouched(() => this.getRoot(), (type) => {
            switch (type) {
                case 'start': { this.animateIn(); } break;
                case 'end': { 
                    const { onClicked } = this.getState();

                    this.animateOut();
                    onClicked?.();
                 } break;
            }
        })
    }

    protected override onStateChanged(): void {
        const { label, color } = this.getState();

        if (this.getPreviousState().label !== label) {
            this.useLabel().typewriterText(label, 0.5);
        }

        this.changeColor(color);
    }

    private changeColor(color: Vec3Arr) {
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
        gsap.to(this.getRoot(), {
            width: this.initialSize.width / 1.2,
            height: this.initialSize.height / 1.2,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }

    private animateOut() {
        gsap.to(this.getRoot(), {
            width: this.initialSize.width,
            height: this.initialSize.height,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }
}