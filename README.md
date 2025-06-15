<div align="center">

<iframe src="https://lottie.host/5573f807-ec89-4552-9454-8473e48cc4ff/OlvoTo8Eeh.lottie" width="300" height="300"></iframe>

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

# 🚀 Creating "C3React" project

_main.ts_

```typescript
import app from "c3react";
import { MainLayout } from "@/layouts/main.layout.ts";

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
import { Layout } from "c3react";
import { MainUI } from "./main.ui.ts";

export class MainLayout extends Layout {
  private readonly ui = new MainUI();

  constructor() {
    super("main");
  }

  protected override onStart = () => {
    let count = 0;

    setInterval(() => {
      this.ui.box.update({
        text: `Count: ${count}`,
      });

      count++;
    }, 1000);
  };
}
```

_layouts/main.ui.ts_

```typescript
import Box from "@/components/box.ts";

export class MainUI {
  readonly box = new Box("#root", {
    text: "{initial_value}",
  });
}
```

```typescript
import { Component } from "c3react";

export default class Box extends Component<{
  /** Declare component events */
}, {
  /** Declare component props */
  text: string;
}> {
  private readonly useText = this.useChild("text");

  protected onReady() {
    /** Triggered once when ready */
  }

  update(props: NonNullable<this["props"]>) {
    const text = this.useText();

    text.x = 0;
    text.typewriterText(props.text, 0.25);
  }
}
```
