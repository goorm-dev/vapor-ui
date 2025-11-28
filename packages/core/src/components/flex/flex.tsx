import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { Box } from '../box';

type FlexVariants = {
    /** 인라인 플렉스 여부 */
    inline?: boolean;
};

/**
 * 플렉스박스 레이아웃 컴포넌트
 */
export const Flex = forwardRef<HTMLDivElement, Flex.Props>((props, ref) => {
    const componentProps = resolveStyles(props);
    const [{ inline }, otherProps] = createSplitProps<FlexVariants>()(componentProps, ['inline']);

    return <Box ref={ref} display={inline ? 'inline-flex' : 'flex'} {...otherProps} />;
});
Flex.displayName = 'Flex';

export namespace Flex {
    type FlexPrimitiveProps = VComponentProps<typeof Box>;

    export interface Props extends FlexPrimitiveProps, FlexVariants {}
}
