import { Component } from 'c3react';

export default class Box extends Component<{
    /** Declare component events */
}, {
    /** Declare component props */
    text: string;
}> {
    private readonly useText = this.useChild('text');

    protected onReady() {
        /** Triggered once when ready */
    }

    update(props: NonNullable<this['props']>) {
        const text = this.useText();

        text.x = 0;
        text.typewriterText(props.text, 0.25);
    }
}
