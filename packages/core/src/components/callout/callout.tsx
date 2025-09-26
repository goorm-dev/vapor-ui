import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { CalloutVariants } from './callout.css';
import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * CalloutRoot
 * -----------------------------------------------------------------------------------------------*/

type CalloutRootPrimitiveProps = VComponentProps<'div'>;
interface CalloutRootProps extends CalloutRootPrimitiveProps, CalloutVariants {}

const CalloutRoot = forwardRef<HTMLDivElement, CalloutRootProps>(
    ({ render, className, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(props, ['color']);

        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root(variantProps), className),
                ...otherProps,
            },
        });
    },
);
CalloutRoot.displayName = 'CalloutRoot';

/* -------------------------------------------------------------------------------------------------
 * CalloutIcon
 * -----------------------------------------------------------------------------------------------*/

type CalloutIconPrimitiveProps = VComponentProps<'div'>;
interface CalloutIconProps extends CalloutIconPrimitiveProps {}

const CalloutIcon = forwardRef<HTMLDivElement, CalloutIconProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.icon, className),
                ...props,
            },
        });
    },
);
CalloutIcon.displayName = 'CalloutIcon';

/* -------------------------------------------------------------------------------------------------
 * Callout Compound Component
 * -----------------------------------------------------------------------------------------------*/

const Callout = {
    Root: CalloutRoot,
    Icon: CalloutIcon,
};

export { Callout, CalloutRoot, CalloutIcon };
export type { CalloutRootProps, CalloutIconProps };
