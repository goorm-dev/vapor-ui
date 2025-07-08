import { forwardRef } from 'react';

import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

type FlexVariants = { inline?: boolean };
type FlexPrimitiveProps = VaporComponentProps<'div'>;

type FlexProps = FlexPrimitiveProps & FlexVariants;

const Flex = forwardRef<HTMLDivElement, FlexProps>(({ className, ...props }, ref) => {
    const [flexVariants, otherProps] = createSplitProps<FlexVariants>()(props, ['inline']);

    return (
        <vapor.div
            ref={ref}
            display={flexVariants.inline ? 'inline-flex' : 'flex'}
            {...otherProps}
        />
    );
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
