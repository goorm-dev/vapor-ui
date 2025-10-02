import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type VStackVariants = { reverse?: boolean };
type VStackPrimitiveProps = VComponentProps<typeof Flex>;

interface VStackProps extends VStackPrimitiveProps, VStackVariants {}

/**
 * Renders a vertical stack container that arranges children in a column layout. Renders a <div> element with flex column direction.
 */
const VStack = forwardRef<HTMLDivElement, VStackProps>(({ children, ...props }, ref) => {
    const [vStackProps, otherProps] = createSplitProps<VStackVariants>()(props, ['reverse']);

    return (
        <Flex
            ref={ref}
            flexDirection={vStackProps.reverse ? 'column-reverse' : 'column'}
            {...otherProps}
        >
            {children}
        </Flex>
    );
});

export { VStack };
export type { VStackProps };
