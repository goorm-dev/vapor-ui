import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { CalloutVariants } from './callout.css';
import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * Callout
 * -----------------------------------------------------------------------------------------------*/

type CalloutPrimitiveProps = VComponentProps<'div'>;
interface CalloutProps extends CalloutPrimitiveProps, CalloutVariants {}

const Callout = forwardRef<HTMLDivElement, CalloutProps>(({ render, className, ...props }, ref) => {
    const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(props, ['color']);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root(variantProps), className),
            ...otherProps,
        },
    });
});
Callout.displayName = 'Callout';

export { Callout };
export type { CalloutProps };
