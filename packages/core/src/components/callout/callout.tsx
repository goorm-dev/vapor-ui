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

export const CalloutRoot = forwardRef<HTMLDivElement, CalloutRoot.Props>(
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

export const CalloutIcon = forwardRef<HTMLDivElement, CalloutIcon.Props>(
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

export namespace CalloutRoot {
    type RootPrimitiveProps = VComponentProps<'div'>;
    export interface Props extends RootPrimitiveProps, CalloutVariants {}
}

export namespace CalloutIcon {
    type IconPrimitiveProps = VComponentProps<'div'>;
    export interface Props extends IconPrimitiveProps {}
}
