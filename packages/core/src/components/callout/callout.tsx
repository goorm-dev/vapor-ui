import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { CalloutVariants } from './callout.css';
import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * CalloutRoot
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Callout compound component, a colored box that highlights a short message such as a notice, tip, or warning. Renders a `<div>` element.
 */
export const CalloutRoot = forwardRef<HTMLDivElement, CalloutRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(componentProps, [
        'colorPalette',
    ]);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.root(variantProps), className),
            ...otherProps,
        },
    });
});
CalloutRoot.displayName = 'CalloutRoot';

/* -------------------------------------------------------------------------------------------------
 * CalloutIcon
 * -----------------------------------------------------------------------------------------------*/

/**
 * Holds an icon inside the callout, sized to the height of one line of its text. Renders a `<div>` element.
 */
export const CalloutIcon = forwardRef<HTMLDivElement, CalloutIcon.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.icon, className),
            ...componentProps,
        },
    });
});
CalloutIcon.displayName = 'CalloutIcon';

/* -------------------------------------------------------------------------------------------------
 * Callout Compound Component
 * -----------------------------------------------------------------------------------------------*/

export namespace CalloutRoot {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State> & CalloutVariants;
}

export namespace CalloutIcon {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
