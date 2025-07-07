import { forwardRef } from 'react';

import { type VaporComponentProps, vapor } from '~/libs/factory';

type BoxProps = VaporComponentProps<'div'>;

const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    return <vapor.div ref={ref} {...props} />;
});
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
