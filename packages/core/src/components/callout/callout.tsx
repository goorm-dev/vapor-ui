'use client';

import { forwardRef } from 'react';

import clsx from 'clsx';

import { type VaporComponentProps, vapor } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

import type { CalloutVariants } from './callout.css';
import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * Callout
 * -----------------------------------------------------------------------------------------------*/

type CalloutPrimitiveProps = Omit<VaporComponentProps<'div'>, 'color'>;

interface CalloutProps extends CalloutPrimitiveProps, CalloutVariants {}

const Callout = forwardRef<HTMLDivElement, CalloutProps>(
    ({ className, children, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(props, ['color']);

        return (
            <vapor.div
                ref={ref}
                className={clsx(styles.root(variantProps), className)}
                {...otherProps}
            >
                {children}
            </vapor.div>
        );
    },
);
Callout.displayName = 'Callout';

export { Callout };
export type { CalloutProps };
