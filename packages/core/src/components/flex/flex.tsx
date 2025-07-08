'use client';

import { forwardRef } from 'react';

import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';

type FlexVariants = {
    /**
     * Set `display` to `inline-flex`.
     * @default false
     */
    inline?: boolean;
};

interface FlexProps extends VaporComponentProps<'div'>, FlexVariants {}

const Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
    return <vapor.div ref={ref} display={props.inline ? 'inline-flex' : 'flex'} {...props} />;
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
