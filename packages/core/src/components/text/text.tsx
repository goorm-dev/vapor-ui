'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { foregroundSprinkles, typographySprinkles } from '~/styles/sprinkles';
import type { Foreground, Typography } from '~/styles/sprinkles';

interface TextProps extends ComponentPropsWithoutRef<typeof Primitive.span> {
    typography?: Typography;
    foreground?: Foreground;
}

const Text = forwardRef<HTMLSpanElement, TextProps>(
    ({ typography, foreground, className, children, ...props }, ref) => {
        return (
            <Primitive.span
                ref={ref}
                className={clsx(
                    className,
                    typographySprinkles({ typography }),
                    foregroundSprinkles({ foreground }),
                )}
                {...props}
            >
                {children}
            </Primitive.span>
        );
    },
);
Text.displayName = 'Text';

export { Text };
export type { TextProps };
