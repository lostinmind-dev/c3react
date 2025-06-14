import type { KeyboardSystem } from '../input/keyboard.ts';
import type { MouseSystem } from '../input/mouse.ts';
import type { PointerSystem } from '../input/pointer.ts';

declare global {
    namespace C3React {
        namespace Pointer {
            type Handler = (e: ConstructPointerEvent) => void;
        }
        
        namespace Mouse {
            type ButtonState = 'up' | 'down' | 'pressed';
            type Handler = (e: MouseEvent) => void;
        
            type WheelDirection = 'up' | 'down';
        }
        
        namespace Keyboard {
            type KeyState = 'up' | 'down' | 'pressed';
            type Handler = (e: KeyboardEvent) => void;
        
            type Side = 'Left' | 'Right';
            type Direction = 'Up' | 'Left' | 'Right' | 'Down';
        
            type TwoSides = [
                'Bracket', 'Control', 'Shift',
                'Alt',
            ];
            type Chars = [
                'q', 'w', 'e', 'r', 't', 't',
                'y', 'u', 'i', 'o', 'p', 'a',
                's', 'd', 'f', 'g', 'h', 'j',
                'k', 'l', 'z', 'x', 'c', 'v',
                'b', 'n', 'm'
            ];
        
            type Keys = {
                Enter: never;
                Escape: never;
                Minus: never;
                Equal: never;
                Backspace: never;
                Tab: never;
                Semicolon: never;
                Quote: never;
                Backquote: never;
                Backslash: never;
                Comma: never;
                Period: never;
                Slash: never;
                Space: never;
                CapsLock: never;
        
                /** Numpad */
                NumpadMultiply: never;
                NumpadSubtract: never;
                NumpadAdd: never;
                NumpadDecimal: never;
                NumLock: never;
        
                PrintScreen: never;
                Pause: never;
                Home: never;
                End: never;
                Insert: never;
                Delete: never;
            } & {
                [Key in `${TwoSides[number]}${Side}`]: never;
            } & {
                [Key in `Digit${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`]: never;
            } & {
                [Key in `F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`]: never;
            } & {
                [Key in `Numpad${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`]: never;
            } & {
                [Key in `Arrow${Direction}`]: never;
            } & {
                [Key in `Page${'Up' | 'Down'}`]: never;
            }
        
            type Key = keyof Keys | `Key${Uppercase<Chars[number]>}`;
        }

        type Position = { x: number, y: number };
        type Size = { width: number, height: number };
    }
    
    const runtime: IRuntime;
    const keyboard: KeyboardSystem;
    const mouse: MouseSystem;
    const pointer: PointerSystem;
}

export {}