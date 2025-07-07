import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { splitLayoutProps } from '~/utils/split-layout-props';

interface BoxProps extends ComponentPropsWithoutRef<typeof vapor.div>, Sprinkles {}

const Box = forwardRef<HTMLDivElement, BoxProps>(({ className, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <vapor.div ref={ref} className={clsx(sprinkles(layoutProps), className)} {...otherProps} />
    );
});
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
