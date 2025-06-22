import app, { Layout, useObject, utils } from 'c3react';

import C3React from '@/components/c3react.ts';
import Button from '@/components/button.ts';


export class MainLayout extends Layout {
    readonly restartBtn = new Button('restart', 'Restart', () => {
        runtime.goToLayout('main');
    });

    readonly c3react = new C3React();

    readonly rotateBtn = new Button('rotate', 'Rotate', (btn) => {
        this.c3react.rotate(utils.random(-360, 360));
    
        btn.change('color', [
            utils.random(0, 255),
            utils.random(0, 255),
            utils.random(0, 255)
        ]);
    });
    
    readonly resizeBtn = new Button('resize', 'Resize', (btn) => {
        const [width, height] = [utils.random(128, 428), utils.random(128, 428)];
        this.c3react.resize(width, height);
    
        btn.change('color', [
            utils.random(0, 255),
            utils.random(0, 255),
            utils.random(0, 255)
        ]);
    });

    readonly setPositionBtn = new Button('set-position', 'Random pos', (btn) => {
        const [x, y] = [utils.random(0, 800), utils.random(0, 600)];
        this.c3react.setPosition(x, y);

        btn.change('color', [
            utils.random(0, 255),
            utils.random(0, 255),
            utils.random(0, 255)
        ]);
    });

    protected onStart() {
        console.log('On start!');
    };
}

const layout = new MainLayout('main');
export default layout;
