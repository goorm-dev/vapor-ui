import type { CSSProperties } from 'react';

import { mergeProps } from '@base-ui/react';
import type { ClassValue } from 'clsx';
import clsx from 'clsx';

export type StyleParams<State> =
    | CSSProperties
    | ((state: State) => CSSProperties | undefined)
    | undefined;

export const resolveStyle = <State>(style: StyleParams<State>, state: State) => {
    if (typeof style === 'function') {
        return style(state);
    }

    return style;
};

export type ClassNameParams<State> =
    | ClassValue
    | ((state: State) => ClassValue | undefined)
    | undefined;

export const resolveClassName = <State>(className: ClassNameParams<State>, state: State) => {
    if (typeof className === 'function') {
        return className(state);
    }

    return className;
};

type StatefulProps<State> = {
    className?: ClassNameParams<State>;
    style?: StyleParams<State>;
};

export const mergeStatefulProps = <State>(
    inputProps: StatefulProps<State>,
    externalProps: StatefulProps<State>,
) => {
    const { className: inputClassName, style: inputStyle } = inputProps;
    const { className: externalClassName, style: externalStyle } = externalProps;

    const className =
        typeof externalClassName === 'function'
            ? (state: State) => clsx(inputClassName, resolveClassName(externalClassName, state))
            : clsx(inputClassName, externalClassName);

    const style =
        typeof externalStyle === 'function'
            ? (state: State) => ({ ...inputStyle, ...resolveStyle(externalStyle, state) })
            : { ...inputStyle, ...externalStyle };

    return {
        ...mergeProps(inputProps, externalProps),
        className,
        style,
    } as StatefulProps<State>;
};
