import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';
import { splitLayoutProps } from '~/utils/split-layout-props';

import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * Callout
 * -----------------------------------------------------------------------------------------------*/

type CalloutPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;
type CalloutVariants = MergeRecipeVariants<typeof styles.root>;

interface CalloutProps extends Omit<CalloutPrimitiveProps, 'color'>, CalloutVariants, Sprinkles {}

const Callout = forwardRef<HTMLDivElement, CalloutProps>(
    ({ className, children, ...props }, ref) => {
        const [layoutProps, calloutProps] = splitLayoutProps(props);
        const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(calloutProps, [
            'color',
        ]);

        return (
            <vapor.div
                ref={ref}
                className={clsx(styles.root(variantProps), sprinkles(layoutProps), className)}
                {...otherProps}
            >
                {children}
            </vapor.div>
        );
    },
);
Callout.displayName = 'Callout';

export { Callout };
export type { CalloutProps };
