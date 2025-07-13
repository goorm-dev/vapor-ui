'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';

interface BoxProps extends ComponentPropsWithoutRef<typeof Primitive.div>, Sprinkles {}

const Box = forwardRef<HTMLDivElement, BoxProps>(({ className, style, ...props }, ref) => {
    const { className: layoutClassName, style: layoutStyle, otherProps } = sprinkles(props);

    return (
        <Primitive.div
            ref={ref}
            className={clsx(layoutClassName, className)}
            style={{ ...layoutStyle, ...style }}
            {...otherProps}
        />
    );
});
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
