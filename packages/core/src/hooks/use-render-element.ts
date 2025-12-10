import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import {
    Children,
    Fragment,
    cloneElement,
    forwardRef,
    isValidElement,
    useMemo,
    useRef,
} from 'react';

import { composeRefs } from '~/utils/compose-refs';
import { getElementRef } from '~/utils/get-element-ref';
import { mergeProps } from '~/utils/merge-props';
import type { AnyProp } from '~/utils/types';

export const useRenderElement = <Props extends object = HTMLAttributes<HTMLDivElement>>(
    children: ReactNode,
    fallback?: ReactElement,
) => {
    const childrenRef = useRef(children);
    childrenRef.current = children;

    const fallbackRef = useRef(fallback);

    const element = useMemo(
        () => createSlot<AnyProp, Props>(childrenRef.current ?? fallbackRef.current),
        [],
    );

    return element;
};

export const createSlot = <Element extends AnyProp, Props>(children: ReactNode) => {
    const Slot = forwardRef<Element, Props>((slotProps, forwardedRef) => {
        if (!isValidElement(children)) {
            return Children.count(children) > 1 ? Children.only(null) : children;
        }

        const childrenRef = getElementRef(children);
        const props = mergeProps(slotProps || {}, children.props);

        if (children.type !== Fragment && children.props.ref) {
            props.ref = composeRefs(forwardedRef, childrenRef);
        }

        return cloneElement(children, props);
    });

    return Slot;
};
