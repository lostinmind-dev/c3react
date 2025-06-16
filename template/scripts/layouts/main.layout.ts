import { Layout } from 'c3react';
import Box from '@/components/box.ts';

function getInitialText() {
    return { initialText: 'Count 0' };
}

export class MainLayout extends Layout {
    readonly box = new Box('box', getInitialText);

    constructor() {
        super('main');
    }

    protected override onStart = () => {
        let count = 0;

        setInterval(() => {
            this.box.text = `Count ${count}`;
            this.box.update();
            count++;
        }, 1000);
    };
}
