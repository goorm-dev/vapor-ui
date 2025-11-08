import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { CalloutVariants } from './callout.css';
import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * CalloutRoot
 * -----------------------------------------------------------------------------------------------*/

export const CalloutRoot = forwardRef<HTMLDivElement, CalloutRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(componentProps, [
        'colorPalette',
    ]);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root(variantProps), className),
            ...otherProps,
        },
    });
});
CalloutRoot.displayName = 'CalloutRoot';

/* -------------------------------------------------------------------------------------------------
 * CalloutIcon
 * -----------------------------------------------------------------------------------------------*/

export const CalloutIcon = forwardRef<HTMLDivElement, CalloutIcon.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.icon, className),
            ...componentProps,
        },
    });
});
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
