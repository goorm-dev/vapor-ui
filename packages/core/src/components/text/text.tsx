import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import { foregroundSprinkles, typographySprinkles } from '~/styles/sprinkles';
import type { Foreground, Typography } from '~/styles/sprinkles';

interface TextProps extends React.ComponentPropsWithoutRef<'span'> {
    typography?: Typography;
    foreground?: Foreground;
}

const Text = forwardRef<HTMLSpanElement, TextProps>(
    ({ typography, foreground, children, className, ...props }, ref) => {
        return (
            <vapor.span
                ref={ref}
                className={clsx(
                    className,
                    typographySprinkles({ typography }),
                    foregroundSprinkles({ foreground }),
                )}
                {...props}
            >
                {children}
            </vapor.span>
        );
    },
);
Text.displayName = 'Text';

export { Text };
export type { TextProps };
