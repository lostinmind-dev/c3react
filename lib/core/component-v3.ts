import type { ExtractObjectInstType } from './component.ts';

export abstract class Component<N extends keyof IConstructProjectObjects> {
    private root!: ExtractObjectInstType<N>;

    constructor(private readonly objectName: N) {

    }

}

export default class Button extends Component<'object'> {
    constructor() {
        super('object');
    }
}

const button = new Button();