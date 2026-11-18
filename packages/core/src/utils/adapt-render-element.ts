import type { CSSProperties, ReactElement, Ref } from 'react';
import { Fragment, cloneElement, isValidElement } from 'react';

import { mergeProps } from '@base-ui/react';
import type { HTMLProps } from '@base-ui/react/types';

import { cn } from './cn';
import { composeRefs } from './compose-refs';
import { getElementRef } from './get-element-ref';
import type { ClassNameParams, StyleParams } from './stateful-props';
import { mergeStatefulStyle } from './stateful-props';

type ElementProps = Record<string, unknown> & {
    className?: ClassNameParams<object>;
    style?: StyleParams<object>;
};

type HostProps = HTMLProps & { ref?: Ref<unknown> };

const hasStatefulCallback = ({ className, style }: ElementProps) =>
    typeof className === 'function' || typeof style === 'function';

/**
 * Turns a `render` element that carries a function `className` / `style` into a render callback.
 *
 * Base UI merges a `render` element's props with `mergeProps`, which joins `className` as a string,
 * so a function `className` gets stringified into its source. A render callback skips that merge:
 * here the host props are merged in by hand and the functions reach the element intact, so the
 * element resolves them against its own state.
 *
 * Every other `render` value is returned as-is.
 *
 * Known limit: the refs are composed inside the render callback, where hooks can't memoize them,
 * so the element's ref detaches and re-attaches on every render of the host. Only render elements
 * with a function `className` / `style` take this path; the rest keep Base UI's memoized ref.
 */
export const adaptRenderElement = <Render>(render: Render): Render => {
    if (!isValidElement<ElementProps>(render) || render.type === Fragment) {
        return render;
    }

    if (!hasStatefulCallback(render.props)) {
        return render;
    }

    const element: ReactElement<ElementProps> = render;
    const elementRef = getElementRef(element);

    const renderCallback = (hostProps: HostProps) => {
        const { className: hostClassName, style: hostStyle, ref: hostRef, ...hostRest } = hostProps;
        const { className, style, ...elementRest } = element.props;

        return cloneElement(element, {
            ...mergeProps(hostRest, elementRest),
            className: cn(hostClassName, className),
            style: mergeStatefulStyle(hostStyle as CSSProperties | undefined, style),
            ref: composeRefs(hostRef, elementRef),
        });
    };

    return renderCallback as Render;
};
