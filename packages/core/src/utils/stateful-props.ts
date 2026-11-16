import type { CSSProperties, ReactElement } from 'react';

import { mergeProps } from '@base-ui/react';
import type { ComponentRenderFn, HTMLProps } from '@base-ui/react/types';
import clsx from 'clsx';

export type StyleParams<State> =
    CSSProperties | ((state: State) => CSSProperties | undefined) | undefined;

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

type StatefulCallbacks<State> = {
    className?: ClassNameParams<State>;
    style?: StyleParams<State>;
    render?: ReactElement | ComponentRenderFn<HTMLProps, State>;
};

/**
 * Lets Base UI call stateful callbacks with its own state while the user still receives the part state.
 * Pass the result straight to the Base UI part; resolving the callbacks first loses the Base state.
 */
export const adaptStatefulCallbacks = <BaseState, PartState>(
    { className, style, render }: StatefulCallbacks<PartState>,
    toPartState: (state: BaseState) => PartState,
): StatefulCallbacks<BaseState> => ({
    className:
        typeof className === 'function'
            ? (state: BaseState) => className(toPartState(state))
            : className,
    style: typeof style === 'function' ? (state: BaseState) => style(toPartState(state)) : style,
    render:
        typeof render === 'function'
            ? (props: HTMLProps, state: BaseState) => render(props, toPartState(state))
            : render,
});
