import app, { pointer } from 'c3react';
import gsap from 'gsap';

import mainLayout from '@/layouts/main.layout.ts';

pointer.init();

app.init({
    layouts: [
        /** Initialize layouts here... */
        mainLayout
    ],
    beforeStart: async () => {
        /** Do someting it's like runOnStartup() inside block  */
        console.log('Before start!')
    },
});

/** Avoid errors with active GSAP animations when changing layout */
app.on('afteranylayoutend', () => gsap.globalTimeline.clear());