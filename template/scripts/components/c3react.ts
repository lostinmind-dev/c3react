import { Component } from 'c3react';
import gsap from 'gsap';

export default class C3React extends Component<'c3react'> {
    constructor() { super('c3react') }

    protected override onRootReady(): void {
        const root = this.getRoot();

        root.setSize(0, 0);

        gsap.to(root, {
            width: 428,
            height: 428,

            duration: 1.25,
            ease: 'back.out',
        });
    }

    protected override onRootDestroyed(): void {
        gsap.killTweensOf(this.getRoot());
        console.log('C3React component was destroyed :3');
    }

    playRotation() {
        gsap.to(this.getRoot(), {
            angleDegrees: 360,

            duration: 1,
            ease: 'power3.out',
            overwrite: true,
        });
    }
}