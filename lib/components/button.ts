import {
    Component, useChild, useTouched, utils,
    type ExtractComponentStateType,
    type StateDataType
} from '../core.ts';

type ButtonAnimation = {
    in: () => Promise<void>,
    out: () => Promise<boolean>, /** triggerOnClicked? */
}

export class C3ReactButton<S extends StateDataType = {}> extends Component<'button', S & {
    /** @default 'empty' */
    text?: Partial<{
        value: string,
        color: `#${string}` | Vec3Arr,
    }>,
}> {
    #animation: ButtonAnimation = {
        in: async () => { },
        out: async () => true,
    };

    protected readonly getText = useChild(() => this.getRoot(), 'text');

    onClicked?: (btn: this) => void;

    #initialSize: C3React.Size = {
        width: 0,
        height: 0,
    };

    protected get initialWidth() {
        return this.#initialSize.width;
    }

    protected get initialHeight() {
        return this.#initialSize.height;
    }

    constructor(tag: string, state?: Partial<S & ExtractComponentStateType<C3ReactButton>>) {
        super({
            objectName: 'button',
            pickBy: (i) => i.hasTags(tag),

            //@ts-ignore;
            state: {
                ...state,
            },
        });

        this.state.onChanged('text', () => this.updateText());
    }

    protected onReady() {
        this.updateInitialSize();
        this.updateText();

        useTouched(() => this.getRoot(), async (type) => {
            switch (type) {
                case 'start': { 
                    await this.#animation.in();
                } break;
                case 'end': {
                    this.#animation.out()
                        .then(triggerOnClicked => {
                            if (!triggerOnClicked) return;

                            this.onClicked?.(this);
                        })
                } break;
            }
        });
    }

    protected setAnimation(animation: ButtonAnimation) {
        this.#animation = animation;
    }

    private updateText() {
        const { text } = this.state.get();
        if (text) {
            const textObj = this.getText();

            if (text.value) textObj.text = text.value;
            if (text.color) textObj.fontColor = typeof text.color === 'string'
                ? utils.rgbToVec3(utils.hexToRgb(text.color))
                : utils.rgbToVec3(text.color)
                ;
        }
    }

    updateInitialSize() {
        const { width, height } = this.getRoot();

        this.#initialSize = { width, height };
    }
}