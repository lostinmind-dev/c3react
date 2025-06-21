import app, { Layout, useInst, utils } from 'c3react';

import C3React from '@/components/c3react.ts';
import Button from '@/components/button.ts';

export class MainLayout extends Layout {
    protected override onStart = () => {
        const c3react = useInst('c3react')();

        console.log(c3react);
        // useUpdate(c3react, 'angle', () => angle);
        // const onClicked = () => {
        //     this.c3react.playRotation();

        //     this.button.color.setValue([
        //         utils.random(0, 255),
        //         utils.random(0, 255),
        //         utils.random(0, 255)
        //     ]);
        // };

        // this.button.onClickedHandler.setValue(onClicked);
    };
}

const layout = new MainLayout('main');
export default layout;
