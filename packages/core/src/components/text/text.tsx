import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import { foregroundSprinkles, typographySprinkles } from '~/styles/sprinkles';
import type { Foreground, Typography } from '~/styles/sprinkles';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { splitLayoutProps } from '~/utils/split-layout-props';

interface TextProps extends React.ComponentPropsWithoutRef<typeof vapor.span>, Sprinkles {
    typography?: Typography;
    foreground?: Foreground;
}

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
