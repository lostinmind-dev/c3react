import { Layout, utils } from 'c3react';

import C3React from '@/components/c3react.ts';
import Button from '@/components/button.ts';

export default class Main extends Layout {
    readonly c3react = new C3React();

    readonly buttons = {
        restart: new Button('restart', { text: { value: 'Restart' } }),
        rotate: new Button('rotate', { text: { value: 'Rotate' } }),
        resize: new Button('resize', { text: { value: 'Resize' } }),
        changePos: new Button('move', { text: { value: 'Move' } }),
    } as const;

    constructor() {
        super('main');
    }
    protected beforeStart() {
        let id: keyof Main['buttons'];

        for (id in this.buttons) {
            const button = this.buttons[id];

            switch (id) {
                case 'restart': {
                    button.onClicked = () => runtime.goToLayout('main');
                } break;
                case 'rotate': {
                    button.onClicked = (btn) => {
                        this.c3react.rotate(utils.random(-360, 360));

                        btn.state.change('color', utils.random3([0, 255]));
                    };
                } break;
                case 'resize': {
                    button.onClicked = (btn) => {
                        const [width, height] = utils.random2([128, 428]);
                        this.c3react.resize(width, height);

                        btn.state.change('color', utils.random3([0, 255]));
                    };
                } break;
                case 'changePos': {
                    button.onClicked = (btn) => {
                        const [x, y] = utils.random2([0, 800], [0, 600]);
                        this.c3react.setPosition(x, y);

                        btn.state.change('color', utils.random3([0, 255]));
                    };
                } break;
            }
        }

    }
    protected onStart() {

    };
}