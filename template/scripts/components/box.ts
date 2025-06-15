import { 
    Component,
    useChild
} from 'c3react';

export default class Box extends Component<{
    initialText: string;
}> {
    private readonly useText = useChild(() => this.container, 'text');

    public text: string = ''

    protected onReady() {
        /** Triggered once when ready */
        const { initialText } = this.useProps();
        this.useText().text = initialText;
    }

    update() {
        const text = this.useText();
        this.useText().x = 0;
        text.typewriterText(this.text, 0.25);
    }
}
