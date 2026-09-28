import { createSplitProps } from './create-split-props';
import { mergeStatefulProps } from './stateful-props';
import type { Styles } from './types';

export const resolveStyles = <T extends object>(props: T) => {
    const [_layoutProps, otherProps] = createSplitProps<Styles>()(props, ['$css']);

    return mergeStatefulProps(props, otherProps) as T;
};
