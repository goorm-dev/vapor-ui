import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type HStackVariants = { reverse?: boolean };
type HStackPrimitiveProps = VComponentProps<typeof Flex>;

interface HStackProps extends HStackPrimitiveProps, HStackVariants {}

const HStack = forwardRef<HTMLDivElement, HStackProps>((props, ref) => {
    const [{ reverse }, otherProps] = createSplitProps<HStackVariants>()(props, ['reverse']);

    return <Flex ref={ref} flexDirection={reverse ? 'row-reverse' : 'row'} {...otherProps} />;
});
HStack.displayName = 'HStack';

export { HStack };
export type { HStackProps };
