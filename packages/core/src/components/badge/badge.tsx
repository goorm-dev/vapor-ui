import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './badge.css';

type BadgePrimitiveProps = Omit<ComponentPropsWithoutRef<'span'>, 'color'>;
type BadgeVariants = MergeRecipeVariants<typeof styles.root>;

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
