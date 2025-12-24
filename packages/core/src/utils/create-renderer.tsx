import type { ReactElement, ReactNode } from 'react';
import { isValidElement } from 'react';

export const createRender = (children: ReactNode, fallback?: ReactElement): ReactElement => {
    if (isValidElement(children)) return children;

    return fallback ?? <>{children}</>;
};
