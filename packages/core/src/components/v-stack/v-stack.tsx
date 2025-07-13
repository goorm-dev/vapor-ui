'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';

import { Flex } from '../flex';

type VStackVariants = { reverse?: boolean };
type VStackPrimitiveProps = ComponentPropsWithoutRef<typeof Flex>;

interface VStackProps extends VStackPrimitiveProps, VStackVariants {}

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
