import { useRender } from '@base-ui/react';

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

    const { className: classNameProp, style: styleProp, ...otherProps } = props;

    const className = classNameProp ? resolveClassName(classNameProp, state) : undefined;
    const style = styleProp ? resolveStyle(styleProp, state) : undefined;

    return useRender({
        ...params,
        props: { className, style, ...otherProps },
    });
};

function resolveClassName<State>(classNames: unknown, state: State) {
    if (!classNames) return undefined;

    const values = Array.isArray(classNames) ? classNames : [classNames];
    const resolved = values
        .map((value) => {
            if (typeof value === 'function') return value(state as State);
            return value;
        })
        .filter(Boolean);

    return resolved.join(' ').trim();
}

function resolveStyle<State>(style: unknown, state: State) {
    return typeof style === 'function' ? style(state) : style;
}
