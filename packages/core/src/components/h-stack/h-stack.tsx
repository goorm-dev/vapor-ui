import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Flex } from '../flex';

import { createSplitProps } from '~/utils/create-split-props';

type HStackVariants = { reverse?: boolean };
type HStackPrimitiveProps = ComponentPropsWithoutRef<typeof Flex>;

interface HStackProps extends HStackPrimitiveProps, HStackVariants {}

const HStack = forwardRef<HTMLDivElement, HStackProps>(({ children, ...props }, ref) => {
    const [hStackProps, otherProps] = createSplitProps<HStackVariants>()(props, ['reverse']);

    return (
        <Flex flexDirection={hStackProps.reverse ? 'row-reverse' : 'row'} ref={ref} {...otherProps}>
            {children}
        </Flex>
    );
});

export { HStack };
export type { HStackProps };
