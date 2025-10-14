import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Box } from '../box';

type FlexVariants = { inline?: boolean };

export const Flex = forwardRef<HTMLDivElement, Flex.Props>((props, ref) => {
    const [variantProps, otherProps] = createSplitProps<FlexVariants>()(props, ['inline']);

    return <Box ref={ref} display={variantProps.inline ? 'inline-flex' : 'flex'} {...otherProps} />;
});
Flex.displayName = 'Flex';

export namespace Flex {
    type FlexPrimitiveProps = VComponentProps<typeof Box>;

    export interface Props extends FlexPrimitiveProps, FlexVariants {}
}
