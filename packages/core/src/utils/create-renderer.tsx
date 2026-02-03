import type { ReactElement, ReactNode } from 'react';
import { Fragment, isValidElement } from 'react';

import type { useRender } from '@base-ui/react/use-render';

// Compatible with base-ui useRender's render prop type
type RenderProp = NonNullable<Parameters<typeof useRender>[0]['render']>;

const isFragment = (element: ReactElement): boolean => {
    return element.type === Fragment;
};

/**
 * Creates a value that can be used as useRender's render prop.
 *
 * When a Fragment needs to be returned, it wraps it in a render callback.
 * This prevents useRender from attempting to pass props (like ref) to the Fragment
 * via React.cloneElement.
 *
 * @param children - The children to render
 * @param fallback - Fallback element to use when children is not a valid element
 * @returns A ReactElement or render callback that can be used as useRender's render prop
 */
export const createRender = (children: ReactNode, fallback?: ReactElement): RenderProp => {
    if (isValidElement(children)) {
        if (isFragment(children)) {
            return () => children;
        }
        return children as ReactElement<Record<string, unknown>>;
    }

    if (fallback) {
        if (isFragment(fallback)) {
            return () => fallback;
        }
        return fallback as ReactElement<Record<string, unknown>>;
    }

    return () => <>{children}</>;
};
