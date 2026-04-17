import { forwardRef } from 'react';

import clsx from 'clsx';

import { useRenderElement } from '~/hooks/use-render-element';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './spinner.css';
import type { SpinnerVariants } from './spinner.css';

/**
 * Animated loading indicator for representing an in-progress async operation. Renders a `<span>` element.
 */
export const Spinner = forwardRef<HTMLSpanElement, Spinner.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<SpinnerVariants>()(componentProps, [
        'size',
        'colorPalette',
    ]);

    const { size, colorPalette } = variantProps;

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        props: {
            role: 'status',
            'aria-label': 'Loading',
            className: clsx(styles.root({ size }), className),
            children: (
                <svg className={styles.icon}>
                    <circle pathLength="100" className={styles.indicator({ colorPalette })} />
                </svg>
            ),
            ...otherProps,
        },
    });
});
Spinner.displayName = 'Spinner';

export namespace Spinner {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State> & SpinnerVariants;
}
