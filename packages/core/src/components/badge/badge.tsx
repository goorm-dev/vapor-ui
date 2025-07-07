import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';
import { splitLayoutProps } from '~/utils/split-layout-props';

import * as styles from './badge.css';

type BadgePrimitiveProps = Omit<ComponentPropsWithoutRef<typeof vapor.span>, 'color'>;
type BadgeVariants = MergeRecipeVariants<typeof styles.root>;

interface BadgeProps extends BadgePrimitiveProps, BadgeVariants, Sprinkles {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, children, ...props }, ref) => {
    const [layoutProps, badgeProps] = splitLayoutProps(props);
    const [variantsProps, otherProps] = createSplitProps<BadgeVariants>()(badgeProps, [
        'color',
        'size',
        'shape',
    ]);

    return (
        <vapor.span
            ref={ref}
            className={clsx(styles.root(variantsProps), sprinkles(layoutProps), className)}
            {...otherProps}
        >
            {children}
        </vapor.span>
    );
});
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
