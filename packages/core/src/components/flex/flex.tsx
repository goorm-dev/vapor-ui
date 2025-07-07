import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';
import { splitLayoutProps } from '~/utils/split-layout-props';

type FlexVariants = { inline?: boolean };
type FlexPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;

interface FlexProps extends FlexPrimitiveProps, FlexVariants, Sprinkles {}

const Flex = forwardRef<HTMLDivElement, FlexProps>(({ className, ...props }, ref) => {
    const [layoutProps, flexProps] = splitLayoutProps(props);
    const [flexVariants, otherProps] = createSplitProps<FlexVariants>()(flexProps, ['inline']);

    return (
        <vapor.div
            ref={ref}
            className={clsx(
                sprinkles({
                    ...layoutProps,
                    display: flexVariants.inline ? 'inline-flex' : 'flex',
                }),
                className,
            )}
            {...otherProps}
        />
    );
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
