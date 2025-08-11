'use client';

import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { BadgeVariants } from './badge.css';
import * as styles from './badge.css';

type BadgePrimitiveProps = Omit<VComponentProps<typeof Primitive.span>, 'color'>;
interface BadgeProps extends BadgePrimitiveProps, BadgeVariants {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, children, ...props }, ref) => {
    const [variantsProps, otherProps] = createSplitProps<BadgeVariants>()(props, [
        'color',
        'size',
        'shape',
    ]);

    return (
        <Primitive.span
            ref={ref}
            className={clsx(styles.root(variantsProps), className)}
            {...otherProps}
        >
            {children}
        </Primitive.span>
    );
});
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
