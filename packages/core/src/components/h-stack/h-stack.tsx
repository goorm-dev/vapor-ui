import { forwardRef } from 'react';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Flex } from '../flex';
import type { RootVariants } from './h-stack.css';
import * as styles from './h-stack.css';

export const HStack = forwardRef<HTMLDivElement, HStack.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [{ reverse }, otherProps] = createSplitProps<RootVariants>()(componentProps, ['reverse']);

    return <Flex ref={ref} className={cn(styles.root({ reverse }), className)} {...otherProps} />;
});
HStack.displayName = 'HStack';

export namespace HStack {
    export type State = {};
    export type Props = VaporUIComponentProps<typeof Flex, State> & RootVariants;
}
