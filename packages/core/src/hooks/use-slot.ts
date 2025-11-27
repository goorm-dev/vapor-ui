import type { HTMLAttributes, ReactNode } from 'react';
import { Children, Fragment, cloneElement, forwardRef, isValidElement, useMemo } from 'react';

import { composeRefs } from '~/utils/compose-refs';
import { getElementRef } from '~/utils/get-element-ref';
import { mergeProps } from '~/utils/merge-props';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface SlotProps extends HTMLAttributes<HTMLElement> {}

export const useSlot = <Element extends Any, Props extends SlotProps>(
    _children: ReactNode,
    fallback?: ReactNode,
) => {
    const Slot = useMemo(
        () =>
            forwardRef<Element, Props>((slotProps, forwardedRef) => {
                const children = _children || fallback;
                if (!isValidElement(children)) {
                    return Children.count(children) > 1 ? Children.only(null) : null;
                }

                const childrenRef = getElementRef(children);
                const props = mergeProps(slotProps || {}, children.props);

                if (children.type !== Fragment && children.props.ref) {
                    props.ref = composeRefs(forwardedRef, childrenRef);
                }

                return cloneElement(children, props);
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [_children],
    );

    return Slot;
};
