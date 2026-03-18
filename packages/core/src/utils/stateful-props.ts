import type { CSSProperties } from 'react';

import { mergeProps } from '@base-ui/react';
import clsx from 'clsx';

export type StyleParams<State> =
    | CSSProperties
    | (CSSProperties & ((state: State) => React.CSSProperties | undefined))
    | undefined;

export const resolveStyle = <State>(style: StyleParams<State>, state: State) => {
    if (typeof style === 'function') {
        return style(state);
    }

    return style;
};

export type ClassNameParams<State> = string | ((state: State) => string | undefined) | undefined;

export const resolveClassName = <State>(className: ClassNameParams<State>, state: State) => {
    if (typeof className === 'function') {
        return className(state);
    }

    return className;
};

type InputProps = { className?: string; style?: React.CSSProperties };
type ExternalProps<State> = { className?: ClassNameParams<State>; style?: StyleParams<State> };

export const mergeStatefulProps = <State>(
    inputProps: InputProps,
    externalProps: ExternalProps<State>,
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
    } as ExternalProps<State>;
};
