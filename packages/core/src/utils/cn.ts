import clsx from 'clsx';
import type { ClassValue } from 'clsx';

type StateResolver<State extends object> = (state: State) => ClassValue;
type ClassNameArg<State extends object> = ClassValue | StateResolver<State>;

export function cn<State extends object>(...classNames: ClassNameArg<State>[]) {
    const hasStateResolver = classNames.some((value) => typeof value === 'function');

    if (!hasStateResolver) {
        return clsx(...classNames);
    }

    return (state: State) =>
        clsx(
            ...classNames.map((className) =>
                typeof className === 'function' ? className(state) : className,
            ),
        );
}
