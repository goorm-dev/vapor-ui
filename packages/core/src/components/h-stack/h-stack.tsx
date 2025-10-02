import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type HStackVariants = { reverse?: boolean };
type HStackPrimitiveProps = VComponentProps<typeof Flex>;

interface HStackProps extends HStackPrimitiveProps, HStackVariants {}

/**
 * Renders a horizontal stack container that arranges children in a row layout. Renders a <div> element with flex row direction.
 */
const HStack = forwardRef<HTMLDivElement, HStackProps>(({ children, ...props }, ref) => {
    const [hStackProps, otherProps] = createSplitProps<HStackVariants>()(props, ['reverse']);

    return (
        <Flex flexDirection={hStackProps.reverse ? 'row-reverse' : 'row'} ref={ref} {...otherProps}>
            {children}
        </Flex>
    );
});
HStack.displayName = 'HStack';

export { HStack };
export type { HStackProps };
