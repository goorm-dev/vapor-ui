import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { BadgeVariants } from './badge.css';
import * as styles from './badge.css';

export const Badge = forwardRef<HTMLSpanElement, Badge.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<BadgeVariants>()(componentProps, [
        'colorPalette',
        'size',
        'shape',
    ]);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        props: {
            className: [styles.root(variantsProps), className],
            ...otherProps,
        },
    });
});
Badge.displayName = 'Badge';

export namespace Badge {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State> & BadgeVariants;
}
