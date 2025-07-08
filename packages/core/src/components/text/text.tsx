'use client';

import { forwardRef } from 'react';

import clsx from 'clsx';

import type { VaporComponentProps } from '~/libs/factory';
import { splitLayoutProps, vapor } from '~/libs/factory';
import { foregroundSprinkles, typographySprinkles } from '~/styles/sprinkles';
import type { Foreground, Typography } from '~/styles/sprinkles';
import { sprinkles } from '~/styles/sprinkles.css';

type TextProps = VaporComponentProps<'span'> & {
    typography?: Typography;
    foreground?: Foreground;
};

const Text = forwardRef<HTMLSpanElement, TextProps>(
    ({ typography, foreground, children, className, ...props }, ref) => {
        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <vapor.span
                ref={ref}
                className={clsx(
                    className,
                    typographySprinkles({ typography }),
                    foregroundSprinkles({ foreground }),
                    sprinkles(layoutProps),
                )}
                {...otherProps}
            >
                {children}
            </vapor.span>
        );
    },
);
Text.displayName = 'Text';

export { Text };
export type { TextProps };
