'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';

import { Box } from '../box';

type FlexVariants = { inline?: boolean };
type FlexPrimitiveProps = ComponentPropsWithoutRef<typeof Box>;

interface FlexProps extends FlexPrimitiveProps, FlexVariants {}

const Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
    const [variantProps, otherProps] = createSplitProps<FlexVariants>()(props, ['inline']);

    return <Box ref={ref} display={variantProps.inline ? 'inline-flex' : 'flex'} {...otherProps} />;
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
