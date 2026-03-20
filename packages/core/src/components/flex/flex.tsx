import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Box } from '../box';

type FlexVariants = { inline?: boolean };

export const Flex = forwardRef<HTMLDivElement, Flex.Props>((props, ref) => {
    const componentProps = resolveStyles(props);
    const [{ inline }, otherProps] = createSplitProps<FlexVariants>()(componentProps, ['inline']);

    return <Box ref={ref} $css={{ display: inline ? 'inline-flex' : 'flex' }} {...otherProps} />;
});
Flex.displayName = 'Flex';

export namespace Flex {
    export type State = {};
    export type Props = VaporUIComponentProps<typeof Box, State> & FlexVariants;
}
