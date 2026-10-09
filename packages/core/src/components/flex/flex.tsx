import { forwardRef } from 'react';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Box } from '../box';
import type { RootVariants } from './flex.css';
import * as styles from './flex.css';

export const Flex = forwardRef<HTMLDivElement, Flex.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [{ inline }, otherProps] = createSplitProps<RootVariants>()(componentProps, ['inline']);

    return <Box ref={ref} className={cn(styles.root({ inline }), className)} {...otherProps} />;
});
Flex.displayName = 'Flex';

export namespace Flex {
    export type State = {};
    export type Props = VaporUIComponentProps<typeof Box, State> & RootVariants;
}
