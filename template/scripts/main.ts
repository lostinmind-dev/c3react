import app from 'c3react';

import Main from '@/layouts/main.layout.ts';

app.init({
    layouts: [Main],
    beforeStart: async () => {
        /** Do someting it's like runOnStartup() inside block  */

    },
});

/** Avoid errors with active GSAP animations when changing layout */
// app.on('afteranylayoutend', () => gsap.globalTimeline.clear());