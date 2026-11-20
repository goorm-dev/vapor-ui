import type { CSSProperties, ReactElement, Ref } from 'react';
import { Fragment, cloneElement, isValidElement } from 'react';

import { mergeProps } from '@base-ui/react';
import type { HTMLProps } from '@base-ui/react/types';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { cn } from './cn';
import { getElementRef } from './get-element-ref';
import type { ClassNameParams, StyleParams } from './stateful-props';
import { mergeStatefulStyle } from './stateful-props';

type ElementProps = Record<string, unknown> & {
    className?: ClassNameParams<object>;
    style?: StyleParams<object>;
};

type HostProps = HTMLProps & { ref?: Ref<unknown> };

interface RenderElementAdapterProps {
    element: ReactElement<ElementProps>;
    hostProps: HostProps;
}

const hasStatefulCallback = ({ className, style }: ElementProps) =>
    typeof className === 'function' || typeof style === 'function';

/**
 * Merges the host props into the render element by hand.
 *
 * A component, not a plain function, so `useMergedRefs` can keep the composed ref stable while the
 * host ref and the element ref stay the same. A new ref on every render would make React detach
 * and re-attach it each time, and a ref that sets state on attach would loop.
 */
const RenderElementAdapter = ({ element, hostProps }: RenderElementAdapterProps) => {
    const { className: hostClassName, style: hostStyle, ref: hostRef, ...hostRest } = hostProps;
    const { className, style, ...elementRest } = element.props;

    const ref = useMergedRefs(hostRef, getElementRef(element));

    return cloneElement(element, {
        ...mergeProps(hostRest, elementRest),
        className: cn(hostClassName, className),
        style: mergeStatefulStyle(hostStyle as CSSProperties | undefined, style),
        ref,
    });
};

/**
 * Turns a `render` element that carries a function `className` / `style` into a render callback.
 *
 * Base UI merges a `render` element's props with `mergeProps`, which joins `className` as a string,
 * so a function `className` gets stringified into its source. A render callback skips that merge:
 * `RenderElementAdapter` merges the host props in by hand and the functions reach the element
 * intact, so the element resolves them against its own state.
 *
 * Every other `render` value is returned as-is. Only render elements with a function
 * `className` / `style` take this path, which adds one `RenderElementAdapter` to the tree.
 */
export const adaptRenderElement = <Render,>(render: Render): Render => {
    if (!isValidElement<ElementProps>(render) || render.type === Fragment) {
        return render;
    }

    if (!hasStatefulCallback(render.props)) {
        return render;
    }

    const element: ReactElement<ElementProps> = render;

    const renderCallback = (hostProps: HostProps) => (
        <RenderElementAdapter element={element} hostProps={hostProps} />
    );

    return renderCallback as Render;
};
