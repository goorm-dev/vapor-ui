'use client';

import { forwardRef } from 'react';

import { Flex, type FlexProps } from '../flex';

interface VStackProps extends Omit<FlexProps, 'flexDirection'> {
    /**
     * Reverse the vertical alignment direction.
     * @default false
     */
    reverse?: boolean;
}

const VStack = forwardRef<HTMLDivElement, VStackProps>(({ reverse, ...restProps }, ref) => {
    return <Flex ref={ref} flexDirection={reverse ? 'column-reverse' : 'column'} {...restProps} />;
});
VStack.displayName = 'VStack';

export { VStack };
export type { VStackProps };
