import app from 'c3react';
import gsap from 'gsap';

import Main from '@/layouts/main.layout.ts';

app.init({
    inputs: ['pointer'],
    layouts: [
        /** Initialize layouts here... */
        new Main(),
    ],
    beforeStart: async () => {
        /** Do someting it's like runOnStartup() inside block  */
    },
});

/** Avoid errors with active GSAP animations when changing layout */
app.on('afteranylayoutend', () => gsap.globalTimeline.clear());