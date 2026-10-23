import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Box } from '../box';

type FlexVariants = {
    /**
     * Displays the container as `inline-flex` instead of `flex`, so it sits inline with surrounding content.
     */
    inline?: boolean;
};

/**
 * Container that lays out its children with flexbox. Use for one-dimensional layouts that need custom direction, alignment, or spacing. Renders a `<div>` element.
 */
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
