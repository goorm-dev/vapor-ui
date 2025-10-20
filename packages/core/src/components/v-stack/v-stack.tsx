import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type VStackVariants = { reverse?: boolean };
type VStackPrimitiveProps = VComponentProps<typeof Flex>;

interface VStackProps extends VStackPrimitiveProps, VStackVariants {}

const VStack = forwardRef<HTMLDivElement, VStackProps>((props, ref) => {
    const componentProps = resolveStyles(props);
    const [vStackProps, otherProps] = createSplitProps<VStackVariants>()(componentProps, [
        'reverse',
    ]);

    return (
        <Flex
            ref={ref}
            flexDirection={vStackProps.reverse ? 'column-reverse' : 'column'}
            {...otherProps}
        />
    );
});

export { VStack };
export type { VStackProps };
