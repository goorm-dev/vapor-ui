'use client';

import { forwardRef } from 'react';

import clsx from 'clsx';

import { type VaporComponentProps, vapor } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

import type { BadgeVariants } from './badge.css';
import * as styles from './badge.css';

type BadgePrimitiveProps = Omit<VaporComponentProps<'span'>, 'color'>;
interface BadgeProps extends BadgePrimitiveProps, BadgeVariants {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, children, ...props }, ref) => {
    const [variantsProps, otherProps] = createSplitProps<BadgeVariants>()(props, [
        'color',
        'size',
        'shape',
    ]);

    return (
        <vapor.span
            ref={ref}
            className={clsx(styles.root(variantsProps), className)}
            {...otherProps}
        >
            {children}
        </vapor.span>
    );
});
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
