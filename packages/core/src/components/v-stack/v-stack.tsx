import { forwardRef } from 'react';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Flex } from '../flex';
import * as styles from './v-stack.css';
import type { RootVariants } from './v-stack.css';

export const VStack = forwardRef<HTMLDivElement, VStack.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [{ reverse }, otherProps] = createSplitProps<RootVariants>()(componentProps, ['reverse']);

    return <Flex ref={ref} className={cn(styles.root({ reverse }), className)} {...otherProps} />;
});
VStack.displayName = 'VStack';

export namespace VStack {
    export type State = {};
    export type Props = VaporUIComponentProps<typeof Flex, State> & RootVariants;
}
