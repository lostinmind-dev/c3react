import { Component, utils } from 'c3react';
import gsap from 'gsap';

export default class C3React extends Component<{}, 'c3react'> {
    constructor() { 
        super({}, 'c3react');
     }

    protected onReady() {
        const root = this.getRoot();
        const dragDrop = root.behaviors.dragDrop;

        dragDrop.addEventListener('drop', () => this.moveToCenter());

        root.setSize(0, 0);
        root.angleDegrees = utils.random(0, 360);

        gsap.to(root, {
            width: 428,
            height: 428,
            angleDegrees: 0,

            duration: 1.25,
            ease: 'back.out',
        });
    }

    protected onDestroyed() {
        gsap.killTweensOf(this.getRoot());
    }

    private moveToCenter() {
        const root = this.getRoot();
        const layerViewport = root.layer.getViewport();

        gsap.to(root, {
            x: (layerViewport.left + layerViewport.right) / 2,
            y: (layerViewport.top + layerViewport.bottom) / 2,

            duration: 0.25,
            ease: 'expo.out',
            overwrite: true,
        })
    }

    setPosition(x: number, y: number) {
        gsap.to(this.getRoot(), {
            x,
            y,

            duration: 1,
            ease: 'power3.out',
            overwrite: true,
        });
    }

    rotate(angleDegrees: number) {
        gsap.to(this.getRoot(), {
            angleDegrees,

            duration: 1,
            ease: 'power3.out',
            overwrite: true,
        });
    }

    resize(width: number, height: number) {
        gsap.to(this.getRoot(), {
            width,
            height,

            duration: 1,
            ease: 'power3.out',
            overwrite: true,
        });
    }
}