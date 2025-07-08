'use client';

import { forwardRef } from 'react';

import { Flex, type FlexProps } from '../flex';

interface HStackProps extends Omit<FlexProps, 'flexDirection'> {
    /**
     * Reverse the horizontal alignment direction.
     * @default false
     */
    reverse?: boolean;
}

const HStack = forwardRef<HTMLDivElement, HStackProps>(({ reverse, ...restProps }, ref) => {
    return <Flex ref={ref} flexDirection={reverse ? 'row-reverse' : 'row'} {...restProps} />;
});
HStack.displayName = 'HStack';

export { HStack };
export type { HStackProps };
