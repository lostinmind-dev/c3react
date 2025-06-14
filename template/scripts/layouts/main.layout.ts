import { Layout } from 'c3react';
import { MainUI } from "./main.ui.ts";

export class MainLayout extends Layout {
    private readonly ui = new MainUI();

    constructor() { super('main') }

    protected override onStart = () => {
        let count = 0;
        setInterval(() => {
            this.ui.box.update({
                text: `te ${count}`
            });

            count++;
        }, 1000);
    }
}