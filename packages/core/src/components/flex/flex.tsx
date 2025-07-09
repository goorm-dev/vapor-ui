'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';

import { Box } from '../box';

type FlexVariants = { inline?: boolean };
type FlexPrimitiveProps = ComponentPropsWithoutRef<typeof Box>;

interface FlexProps extends FlexPrimitiveProps, FlexVariants {}

const Flex = forwardRef<HTMLDivElement, FlexProps>(({ style, className, ...props }, ref) => {
    const [flexVariants, otherProps] = createSplitProps<FlexVariants>()(props, ['inline']);

    return (
        <Box
            style={{ display: flexVariants.inline ? 'inline-flex' : 'flex', ...style }}
            ref={ref}
            {...otherProps}
        />
    );
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
