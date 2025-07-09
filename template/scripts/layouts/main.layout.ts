import app, { Layout, useComponent, utils } from 'c3react';

import C3React from '@/components/c3react.ts';
import Button from '@/components/button.ts';

const [useButton, createButton] = useComponent(Button);

export default class Main extends Layout {
    readonly c3react = new C3React();

    readonly restartButton = new Button('restart', {
        text: 'Restart',
    });
    readonly rotateButton = new Button('rotate', {
        text: 'Rotate',
    });
    readonly resizeButton = new Button('resize', {
        text: 'Resize',
    });
    readonly changePositionButton = new Button('set-position', {
        text: 'Move'
    })

    constructor() {
        super('main');
    }
    protected beforeStart() {
        this.restartButton.onClicked = () => runtime.goToLayout('main');
        this.rotateButton.onClicked = (btn) => {
            this.c3react.rotate(utils.random(-360, 360));

            btn.state.change('color', utils.random3([0, 255]));
        };
        this.resizeButton.onClicked = (btn) => {
            const [width, height] = utils.random2([128, 428]);
            this.c3react.resize(width, height);

            btn.state.change('color', utils.random3([0, 255]));
        };
        this.changePositionButton.onClicked = (btn) => {
            const [x, y] = utils.random2([0, 800], [0, 600]);
            this.c3react.setPosition(x, y);

            btn.state.change('color', utils.random3([0, 255]));
        };


    }
    protected onStart() {
        console.log(useButton((btn) => btn.state.get('text') === 'Restart'))
    };
}