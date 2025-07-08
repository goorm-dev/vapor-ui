'use client';

import { forwardRef } from 'react';

import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';

interface BoxProps extends VaporComponentProps<'div'> {}

const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    return <vapor.div ref={ref} {...props} />;
});
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
