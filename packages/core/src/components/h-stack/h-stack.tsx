import { forwardRef } from 'react';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Flex } from '../flex';

type HStackVariants = {
    /** 역방향 배치 여부 */
    reverse?: boolean;
};

/**
 * 가로 방향 스택 레이아웃 컴포넌트
 */
export const HStack = forwardRef<HTMLDivElement, HStack.Props>((props, ref) => {
    const [{ reverse }, otherProps] = createSplitProps<HStackVariants>()(props, ['reverse']);

    return <Flex ref={ref} flexDirection={reverse ? 'row-reverse' : 'row'} {...otherProps} />;
});
HStack.displayName = 'HStack';

export namespace HStack {
    type HStackPrimitiveProps = VComponentProps<typeof Flex>;

    export interface Props extends HStackPrimitiveProps, HStackVariants {}
}
