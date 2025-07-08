'use client';

import { forwardRef } from 'react';

import type { VaporComponentProps } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

import { Flex } from '../flex';

type HStackVariants = { reverse?: boolean };
type HStackPrimitiveProps = VaporComponentProps<typeof Flex>;

type HStackProps = HStackPrimitiveProps & HStackVariants;

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
