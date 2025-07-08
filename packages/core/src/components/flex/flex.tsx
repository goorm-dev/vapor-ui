'use client';

import { forwardRef } from 'react';

import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

type FlexVariants = {
    /**
     * `display`를 `inline-flex`로 설정합니다.
     * @default false
     */
    inline?: boolean;
};

type FlexProps = VaporComponentProps<'div'> & FlexVariants;

const Flex = forwardRef<HTMLDivElement, FlexProps>(({ className, ...props }, ref) => {
    const [flexVariants, otherProps] = createSplitProps<FlexVariants>()(props, ['inline']);

    return (
        <vapor.div
            ref={ref}
            className={className}
            display={flexVariants.inline ? 'inline-flex' : 'flex'}
            {...otherProps}
        />
    );
});
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps };
