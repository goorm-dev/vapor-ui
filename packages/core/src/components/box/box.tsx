import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { vapor } from '~/libs/factory';

interface BoxProps extends ComponentPropsWithoutRef<typeof vapor.div> {}

const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    return <vapor.div ref={ref} {...props} />;
});

export { Box };
export type { BoxProps };
