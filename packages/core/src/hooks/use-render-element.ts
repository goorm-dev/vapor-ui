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

export const useRenderElement = <Element extends AnyProp, Props extends SlotProps>(
    children: ReactNode,
    fallback?: ReactElement,
) => {
    // children을 ref로 저장하여 최신 값 참조
    const childrenRef = useRef(children);
    childrenRef.current = children;

    const fallbackRef = useRef(fallback);
    // fallback은 변경되지 않는다고 가정하고 최초 값 유지

    const Slot = useMemo(
        () => createSlot<Element, Props>(childrenRef.current ?? fallbackRef.current),
        [],
    );

    return Slot;
};

interface SlotProps extends HTMLAttributes<HTMLElement> {}

export const createSlot = <Element extends AnyProp, Props extends SlotProps>(
    children: ReactNode,
) => {
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
