import { Component, useChild, useTouched, utils, useState } from 'c3react';
import gsap from 'gsap';

export default class Button extends Component<'button'> {
    private readonly useLabel = useChild(() => this.getRoot(), 'text');

    readonly label = useState('C3React');
    readonly onClickedHandler = useState<() => void>(() => {});
    readonly color = useState<Vec3Arr>([148, 169, 184]);

    private readonly initialSize = useState<C3React.Size>({
        width: 0,
        height: 0,
    });

    constructor(id: 'c3react') {
        super('button', (i) => i.instVars.id === id);
    }

    protected override onRootReady() {
        const { width, height } = this.getRoot();
        this.initialSize.setValue({ width, height });

        this.updateText();
        this.updateColor();

        useTouched(() => this.getRoot(), (type) => {
            switch (type) {
                case 'start': { this.animateIn(); } break;
                case 'end': {
                    const onClicked = this.onClickedHandler.getValue();
                    this.animateOut();
                    onClicked();
                } break;
            }
        });

        this.label.on('update', () => this.updateText());
        this.color.on('update', () => this.updateColor());
    }

    private updateText() {
        const label = this.label.getValue();
        this.useLabel().text = label;
    }

    private updateColor() {
        const color = this.color.getValue();
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
        const { width,height } = this.initialSize.getValue();

        gsap.to(this.getRoot(), {
            width: width / 1.2,
            height: height / 1.2,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }

    private animateOut() {
        const { width, height } = this.initialSize.getValue();

        gsap.to(this.getRoot(), {
            width,
            height,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }
}