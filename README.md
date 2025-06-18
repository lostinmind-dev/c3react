<div align="center">

<img src="./c3react.gif" width="150" height="150"></img>

<h1>
    C3React
</h1>

[**Construct 3**](https://construct.net/) Tool Kit for _**fast**_ AND _**easy**_
scripting

</div>

## Usage

- **[💪 Advantages](#-advantages)**
- **[🚀 Quickstart](#-quickstart)**
- **[`🚀 "C3React" Template project`](#-c3react-template-project)**

# 💪 Advantages

**Construct 3**.

> - ⚡️ **Using the powerful _**JavaScript Runtime**_ [Deno](https://deno.com).**
> - 📝 **_**Typescript**_ oriented tool**
> - 🚀 **Fast build using [Vite](https://vite.dev/)**
> - 🔍 **Availability to use [NPM](https://www.npmjs.com/) and
>   [JSR](https://jsr.io/) packages**

**PRINCIPLES**

- _**public**_ methods are for using **ONLY** outside component
- _**protected**_ methods are for using **ONLY** inside component
- get/set without _**public**_/_**protected**_ are for using **BOTH** inside and
  outside component
- _setState()_ component's method must be using **ONLY** outside

**Project Structure**

```bash
project/
├── project.c3proj
└── ...
scripts/
├── components/
│   └── *.ts
├── layouts/
│   └── *.layout.ts
└── main.ts
```

# 🚀 Quickstart

- **Install [Deno (JavaScript runtime)](https://docs.deno.com/runtime/)**
- **Open C3 Template project in VSCode** `./template/`
- **Install dependencies**

```bash
npm install
```

- **Open C3 project** `./project/`
- **Run following command:**

```bash
deno task dev
```

# 🚀 "C3React" Template project

_Template is using GSAP tool for small beautiful animations (NPM module)_

_main.ts_

```typescript
import app, { pointer } from 'c3react';
import gsap from 'gsap';

import mainLayout from '@/layouts/main.layout.ts';

pointer.init();

app.init({
    layouts: [
        /** Initialize layouts here... */
        mainLayout,
    ],
    beforeStart: async () => {
        /** Do someting it's like runOnStartup() inside block  */
        console.log('Before start!');
    },
});

/** Avoid errors with active GSAP animations when changing layout */
app.on('afteranylayoutend', () => gsap.globalTimeline.clear());
```

# 🔌 Using "C3React" Component System

_layouts/main.layout.ts_

```typescript
import { Layout, utils } from 'c3react';

import C3React from '@/components/c3react.ts';
import Button from '@/components/button.ts';

export class MainLayout extends Layout {
    private readonly c3react = new C3React();
    private readonly button = new Button('c3react');

    protected override onStart = () => {
        const onClicked = () => {
            this.c3react.play();

            this.button.setState({
                color: [
                    utils.random(0, 255),
                    utils.random(0, 255),
                    utils.random(0, 255),
                ],
            });
        };

        this.button.setState({
            label: 'C3React :>',
            color: [0, 225, 199],
            onClicked,
        });
    };
}

const layout = new MainLayout('main');
export default layout;
```

_components/c3react.ts_

```typescript
import { Component } from 'c3react';
import gsap from 'gsap';

export default class C3React extends Component<{}, 'c3react'> {
    constructor() {
        super({}, 'c3react');
    }

    protected override onReady(): void {
        const root = this.getRoot();

        root.setSize(0, 0);

        gsap.to(root, {
            width: 428,
            height: 428,

            duration: 1.25,
            ease: 'back.out',
        });
    }

    protected override onDestroyed(): void {
        gsap.killTweensOf(this.getRoot());
        console.log('C3React component was destroyed :3');
    }

    play() {
        gsap.to(this.getRoot(), {
            angleDegrees: 360,

            duration: 1,
            ease: 'power3.out',
            overwrite: true,
        });
    }
}
```

_components/button.ts_

```typescript
import { Component, useChild, useTouched, utils } from 'c3react';
import gsap from 'gsap';

export default class Button extends Component<{
    onClicked?: () => void;
    label: string;
    color: Vec3Arr;
}, 'button'> {
    private readonly useLabel = useChild(() => this.getRoot(), 'text');

    private initialSize: C3React.Size = {
        width: 0,
        height: 0,
    };

    constructor(id: 'c3react') {
        super(
            { color: [0, 225, 199], label: 'C3React' },
            'button',
            (i) => i.instVars.id === id,
        );
    }

    protected override onReady(): void {
        const { label, color } = this.getState();
        const { width, height } = this.getRoot();
        this.initialSize = { width, height };

        this.useLabel().text = label;
        this.changeColor(color);

        useTouched(() => this.getRoot(), (type) => {
            switch (type) {
                case 'start':
                    {
                        this.animateIn();
                    }
                    break;
                case 'end':
                    {
                        const { onClicked } = this.getState();

                        this.animateOut();
                        onClicked?.();
                    }
                    break;
            }
        });
    }

    protected override onStateChanged(): void {
        const { label, color } = this.getState();

        if (this.getPreviousState().label !== label) {
            this.useLabel().typewriterText(label, 0.5);
        }

        this.changeColor(color);
    }

    private changeColor(color: Vec3Arr) {
        const root = this.getRoot();

        const [r, g, b] = root.colorRgb;
        const rgb = utils.rgbToVec3(color);

        const $ = { r, g, b };
        gsap.to($, {
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],

            duration: 1,
            ease: 'power4.out',
            overwrite: true,
            onUpdate: () => {
                root.colorRgb = [$.r, $.g, $.b];
            },
        });
    }

    private animateIn() {
        gsap.to(this.getRoot(), {
            width: this.initialSize.width / 1.2,
            height: this.initialSize.height / 1.2,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }

    private animateOut() {
        gsap.to(this.getRoot(), {
            width: this.initialSize.width,
            height: this.initialSize.height,

            duration: 0.2,
            ease: 'power4.out',
            overwrite: true,
        });
    }
}
```
