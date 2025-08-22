import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { CalloutVariants } from './callout.css';
import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * Callout
 * -----------------------------------------------------------------------------------------------*/

type CalloutPrimitiveProps = VComponentProps<typeof Primitive.div>;
interface CalloutProps extends CalloutPrimitiveProps, CalloutVariants {}

const Callout = forwardRef<HTMLDivElement, CalloutProps>(
    ({ className, children, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(props, ['color']);

        return (
            <Primitive.div
                ref={ref}
                className={clsx(styles.root(variantProps), className)}
                {...otherProps}
            >
                {children}
            </Primitive.div>
        );
    },
);
Callout.displayName = 'Callout';

export { Callout };
export type { CalloutProps };
