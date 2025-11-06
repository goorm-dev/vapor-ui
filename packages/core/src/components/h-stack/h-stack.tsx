import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type HStackVariants = { reverse?: boolean };

export const HStack = forwardRef<HTMLDivElement, HStack.Props>(({ children, ...props }, ref) => {
    const [hStackProps, otherProps] = createSplitProps<HStackVariants>()(props, ['reverse']);

    return (
        <Flex flexDirection={hStackProps.reverse ? 'row-reverse' : 'row'} ref={ref} {...otherProps}>
            {children}
        </Flex>
    );
});
HStack.displayName = 'HStack';

export namespace HStack {
    type HStackPrimitiveProps = VComponentProps<typeof Flex>;

    export interface Props extends HStackPrimitiveProps, HStackVariants {}
}
