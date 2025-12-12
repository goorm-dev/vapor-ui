import type { HTMLAttributes, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

import { mergeProps } from '@base-ui-components/react/merge-props';
import { getReactElementRef } from '@base-ui-components/utils/getReactElementRef';

export const createDefaultElement = <Props extends object = HTMLAttributes<HTMLElement>>(
    children: ReactNode,
    defaultProps?: Partial<Props>,
) => {
    if (!isValidElement<Props>(children)) {
        return children;
    }

    const childrenRef = getReactElementRef(children);
    const props = mergeProps(defaultProps, children.props);

    props.ref = childrenRef;

    return cloneElement(children, props);
};
