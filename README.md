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
- **[`🚀 Creating "C3React" project`](#-creating-c3react-project)**
- **[`🔌 Using "C3React" Component System`](#-using-c3react-component-system)**

# 💪 Advantages

**Construct 3**.

> - ⚡️ **Using the powerful _**JavaScript Runtime**_ [Deno](https://deno.com).**
> - 📝 **_**Typescript**_ oriented tool**
> - 🚀 **Fast build using [Vite](https://vite.dev/)**
> - 🔍 **Availability to use [NPM](https://www.npmjs.com/) and
>   [JSR](https://jsr.io/) packages**

**PRINCIPLES**
> 1. Если используется Root инстанст, он ни в коем случае не должен подвергатся изменений напрямую извне
> 1. State компонента через getState() может быть использован только внутри
> 2. Изменять State компонента можно извне

короче инкапсуляция ебанная ага да

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
├── systems/
│   └── *.system.ts
└── main.ts
```

# 🚀 Creating "C3React" project

_main.ts_

```typescript
import app from 'c3react';
import { MainLayout } from '@/layouts/main.layout.ts';

app.init({
    layouts: [
        /** Initialize layouts here... */
        new MainLayout(),
    ],
    beforeStart: async () => {
        /** Load packages or modules here... */
        // app.addScript('https://cdn.com/index.js');
    },
});
```

# 🔌 Using "C3React" Component System

_layouts/main.layout.ts_

```typescript
import { Layout } from 'c3react';
import Box from '@/components/box.ts';

function getInitialText() {
    return { initialText: 'Count 0' };
}

export class MainLayout extends Layout {
    readonly box = new Box('box', getInitialText);

    constructor() {
        super('main');
    }

    protected override onStart = () => {
        let count = 0;

        setInterval(() => {
            this.box.text = `Count ${count}`;
            this.box.update();
            count++;
        }, 1000);
    };
}
```

_components/box.ts_

```typescript
import { Component, useChild } from 'c3react';

export default class Box extends Component<{
    initialText: string;
}> {
    private readonly useText = useChild(() => this.container, 'text');

    public text: string = '';

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
```
