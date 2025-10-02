import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Box } from '../box';

type FlexVariants = { inline?: boolean };
type FlexPrimitiveProps = VComponentProps<typeof Box>;

interface FlexProps extends FlexPrimitiveProps, FlexVariants {}

/**
 * Renders a flexible container with flexbox layout. Renders a <div> element with display flex.
 */
const Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
    const [variantProps, otherProps] = createSplitProps<FlexVariants>()(props, ['inline']);

    return <Box ref={ref} display={variantProps.inline ? 'inline-flex' : 'flex'} {...otherProps} />;
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
