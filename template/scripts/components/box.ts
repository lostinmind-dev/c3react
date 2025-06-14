import { 
    Component,
    useChild
} from 'c3react';

export default class Box extends Component<{
    text: string;
}> {
    private readonly useText = useChild(this, 'text');

    protected onReady() {
        /** Triggered once when ready */
    }

    update() {
        const props = this.useProps();
        const text = this.useText();

        this.useText().x = 0;
        text.typewriterText(props.text, 0.25);
    }
}
