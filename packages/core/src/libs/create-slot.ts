import type { HTMLAttributes, ReactNode } from 'react';
import { Children, Fragment, cloneElement, forwardRef, isValidElement } from 'react';

import { composeRefs } from '~/utils/compose-refs';
import { getElementRef } from '~/utils/get-element-ref';
import { mergeProps } from '~/utils/merge-props';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface SlotProps extends HTMLAttributes<HTMLElement> {}

export const createSlot = <Element extends Any, Props extends SlotProps>(children: ReactNode) => {
    const Slot = forwardRef<Element, Props>((slotProps, forwardedRef) => {
        if (!isValidElement(children)) {
            return Children.count(children) > 1 ? Children.only(null) : null;
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
