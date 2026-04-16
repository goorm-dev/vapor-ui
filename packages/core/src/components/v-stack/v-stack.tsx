import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type VStackVariants = { reverse?: boolean };

export const VStack = forwardRef<HTMLDivElement, VStack.Props>((props, ref) => {
    const componentProps = resolveStyles(props);
    const [vStackProps, otherProps] = createSplitProps<VStackVariants>()(componentProps, [
        'reverse',
    ]);

    return (
        <Flex
            ref={ref}
            $css={{ flexDirection: vStackProps.reverse ? 'column-reverse' : 'column' }}
            {...otherProps}
        />
    );
});
VStack.displayName = 'VStack';

export namespace VStack {
    export type State = {};
    export type Props = VaporUIComponentProps<typeof Flex, State> & VStackVariants;
}
