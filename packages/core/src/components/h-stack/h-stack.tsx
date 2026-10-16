import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VaporUIComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type HStackVariants = {
    /**
     * Reverses the order of the children, setting `flex-direction` to `row-reverse`.
     */
    reverse?: boolean;
};

/**
 * Flex container that arranges its children horizontally in a row. Renders a `<div>` element.
 */
export const HStack = forwardRef<HTMLDivElement, HStack.Props>((props, ref) => {
    const [{ reverse }, otherProps] = createSplitProps<HStackVariants>()(props, ['reverse']);

    return (
        <Flex ref={ref} $css={{ flexDirection: reverse ? 'row-reverse' : 'row' }} {...otherProps} />
    );
});
HStack.displayName = 'HStack';

export namespace HStack {
    export type State = {};
    export type Props = VaporUIComponentProps<typeof Flex, State> & HStackVariants;
}
