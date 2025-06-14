import type { Component } from "../component.ts";

export type UseCondition<InstType> = (inst: InstType) => boolean;
export type ComponentConstructor<T extends Component = Component> = new (...args: any[]) => T;
