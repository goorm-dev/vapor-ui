'use client';

import { forwardRef } from 'react';

import type { VaporComponentProps } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

import { Flex } from '../flex';

type VStackVariants = { reverse?: boolean };
type VStackPrimitiveProps = VaporComponentProps<typeof Flex>;

type VStackProps = VStackPrimitiveProps & VStackVariants;

const VStack = forwardRef<HTMLDivElement, VStackProps>(({ children, ...props }, ref) => {
    const [vStackProps, otherProps] = createSplitProps<VStackVariants>()(props, ['reverse']);

    return (
        <Flex
            flexDirection={vStackProps.reverse ? 'column-reverse' : 'column'}
            ref={ref}
            {...otherProps}
        >
            {children}
        </Flex>
    );
});

export { VStack };
export type { VStackProps };
