import Box from '@/components/box.ts';

export class MainUI {
    readonly box = new Box('#root', () => {
        return { text: 'Test' }
    });
}