import clsx from 'clsx';

import type { ClassNameParams } from './stateful-props';
import { resolveClassName } from './stateful-props';

export function cn(...classNames: string[]): string;
export function cn<State extends object>(
    ...classNames: ClassNameParams<State>[]
): string | ((state: State) => string);
export function cn<State extends object>(...classNames: ClassNameParams<State>[]) {
    const hasStateResolver = classNames.some((value) => typeof value === 'function');

    if (!hasStateResolver) {
        return clsx(...classNames);
    }

    return (state: State) =>
        clsx(...classNames.map((className) => resolveClassName(className, state)));
}
