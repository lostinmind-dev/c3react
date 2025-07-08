import { Layout, utils } from 'c3react';

import C3React from '@/components/c3react.ts';
import Button from '@/components/button.ts';


export default class Main extends Layout {
    readonly c3react = new C3React();

    readonly restartButton = new Button('restart', {
        onClicked: () => runtime.goToLayout('main')
    });
    readonly rotateButton = new Button('rotate', {
        onClicked: (btn) => { 
            this.c3react.rotate(utils.random(-360, 360)); 

            btn.change('color', utils.random3([0, 255]));
        }
    });
    readonly resizeButton = new Button('resize', {
        onClicked: (btn) => {
            const [width, height] = utils.random2([128, 428]);
            this.c3react.resize(width, height);

            btn.change('color', utils.random3([0, 255]));
        }
    });
    readonly changePositionButton = new Button('set-position', {
        onClicked: (btn) => {
            const [x, y] = utils.random2([0, 800], [0, 600]);
            this.c3react.setPosition(x, y);

            btn.change('color', utils.random3([0, 255]));
        }
    })

    constructor() {
        super('main');
    }

    protected onStart() {
        // this.ui.

    };
}