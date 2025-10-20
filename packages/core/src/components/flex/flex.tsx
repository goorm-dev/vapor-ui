import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { Box } from '../box';

type FlexVariants = { inline?: boolean };
type FlexPrimitiveProps = VComponentProps<typeof Box>;

interface FlexProps extends FlexPrimitiveProps, FlexVariants {}

const Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
    const componentProps = resolveStyles<FlexProps>(props);
    const [{ inline }, otherProps] = createSplitProps<FlexVariants>()(componentProps, ['inline']);

    return <Box ref={ref} display={inline ? 'inline-flex' : 'flex'} {...otherProps} />;
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
