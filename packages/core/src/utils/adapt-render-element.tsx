import type { ReactElement, Ref } from 'react';
import { Fragment, cloneElement, forwardRef, isValidElement } from 'react';

import { mergeProps } from '@base-ui/react';
import type { HTMLProps } from '@base-ui/react/types';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { getElementRef } from './get-element-ref';
import type { ClassNameParams, StyleParams } from './stateful-props';
import { mergeStatefulProps } from './stateful-props';

type ElementProps = Record<string, unknown> & {
    className?: ClassNameParams<object>;
    style?: StyleParams<object>;
};

type HostProps = HTMLProps & { ref?: Ref<unknown> };

interface RenderElementAdapterProps extends HostProps {
    element: ReactElement<ElementProps>;
    hostProps: HostProps;
}

const hasStatefulCallback = ({ className, style }: ElementProps) =>
    typeof className === 'function' || typeof style === 'function';

/**
 * Merges the host props into the render element with `mergeStatefulProps`, which keeps a function
 * `className` / `style` a function.
 *
 * A component, not a plain function, so `useMergedRefs` can keep the composed ref stable while the
 * host ref and the element ref stay the same. A new ref on every render would make React detach
 * and re-attach it each time, and a ref that sets state on attach would loop.
 *
 * A host that renders the adapted callback itself and then passes the result on as a `render`
 * element (Toolbar does) gets the adapter cloned with more props. Those land on the adapter, so it
 * merges them over `hostProps` instead of dropping them.
 */
const RenderElementAdapter = forwardRef<HTMLElement, RenderElementAdapterProps>(
    ({ element, hostProps, ...clonedProps }, clonedRef) => {
        const { ref: hostRef, ...hostRest } = hostProps;

        const ref = useMergedRefs(hostRef, clonedRef, getElementRef(element));
        const outerProps = mergeProps(hostRest, clonedProps);

        return cloneElement(element, { ...mergeStatefulProps(outerProps, element.props), ref });
    },
);
RenderElementAdapter.displayName = 'RenderElementAdapter';

/**
 * Turns a `render` element that carries a function `className` / `style` into a render callback.
 *
 * Base UI merges a `render` element's props with `mergeProps`, which joins `className` as a string,
 * so a function `className` gets stringified into its source. A render callback skips that merge:
 * `RenderElementAdapter` merges the host props in by hand and the functions reach the element
 * intact, so the element resolves them against its own state.
 *
 * Every other `render` value is returned as-is. Only render elements with a function
 * `className` / `style` take this path, which adds one `RenderElementAdapter` to the tree. So
 * switching the element's `className` between a string and a function remounts its DOM node.
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
