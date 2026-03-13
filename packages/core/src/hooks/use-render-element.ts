import { useRender } from '@base-ui/react';

import { resolveClassName, resolveStyle } from '~/utils/stateful-props';
import type { ClassNameParams, StyleParams } from '~/utils/stateful-props';

type Params<
    State extends Record<string, unknown>,
    RenderedElementType extends Element,
    Enabled extends boolean | undefined = undefined,
> = useRender.Parameters<State, RenderedElementType, Enabled>;

export const useRenderElement = <
    State extends Record<string, unknown>,
    RenderedElementType extends Element,
    Enabled extends boolean | undefined = undefined,
>(
    params: Params<State, RenderedElementType, Enabled>,
): useRender.ReturnValue<Enabled> => {
    const { state, props = {} } = params;
    const resolvedState = (state ?? {}) as State;

    const { className: classNameProp, style: styleProp, ...otherProps } = props;

    const className = isClassNameParam<State>(classNameProp)
        ? resolveClassName(classNameProp, resolvedState)
        : undefined;

    const style = isStyleParam<State>(styleProp)
        ? resolveStyle(styleProp, resolvedState)
        : undefined;

    return useRender({
        ...params,
        props: { className, style, ...otherProps },
    });
};

function isClassNameParam<State>(value: unknown): value is ClassNameParams<State> {
    return typeof value === 'string' || typeof value === 'function';
}

function isStyleParam<State>(value: unknown): value is StyleParams<State> {
    return typeof value === 'object' || typeof value === 'function';
}
