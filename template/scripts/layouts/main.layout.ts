import { Layout, utils } from 'c3react';

import C3React from '@/components/c3react.ts';
import Button from '@/components/button.ts';

export class MainLayout extends Layout {
    private readonly c3react = new C3React();
    private readonly button = new Button('c3react');

    protected override onStart = () => {
        const onClicked = () => {
            this.c3react.playRotation();

            this.button.color.setValue([
                utils.random(0, 255),
                utils.random(0, 255),
                utils.random(0, 255)
            ]);
        };

        this.button.onClickedHandler.setValue(onClicked);
    };
}

const layout = new MainLayout('main');
export default layout;
