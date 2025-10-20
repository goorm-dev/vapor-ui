import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { BadgeVariants } from './badge.css';
import * as styles from './badge.css';

type BadgePrimitiveProps = VComponentProps<'span'>;
interface BadgeProps extends BadgePrimitiveProps, BadgeVariants {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<BadgeVariants>()(componentProps, [
        'color',
        'size',
        'shape',
    ]);

    return useRender({
        ref,
        render: render || <span />,
        props: {
            className: clsx(styles.root(variantsProps), className),
            ...otherProps,
        },
    });
});
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
