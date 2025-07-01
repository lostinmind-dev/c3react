// import { Layout, utils } from 'c3react';

// import C3React from '@/components/c3react.ts';
// import Button from '@/components/button.ts';

import { app, useOnStart } from '../../../lib/core/app-v2.ts';

export default function Objects(layout: IAnyProjectLayout) {
    console.log(runtime);

    useOnStart(() => {
        app.on('pointerdown', () => runtime.goToLayout('main'), { cached: true });
        console.log(`On start of layout [${layout.name}]`);
    });
}