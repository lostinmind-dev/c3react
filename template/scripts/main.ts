import app from 'c3react';
import { MainLayout } from '@/layouts/main.layout.ts';

app.init({
    layouts: [
        /** Initialize layouts here... */
        new MainLayout(),
    ],
    beforeStart: async () => {
        /** Load packages or modules here... */
    },
});
