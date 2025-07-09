'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';

interface BoxProps extends ComponentPropsWithoutRef<typeof Primitive.div> {}

const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    return <Primitive.div ref={ref} {...props} />;
});
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
