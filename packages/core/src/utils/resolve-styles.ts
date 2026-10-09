import { sprinkles } from '~/styles/sprinkles.css';

import { createSplitProps } from './create-split-props';
import { mergeStatefulProps } from './stateful-props';
import type { Styles } from './types';

export const resolveStyles = <T extends object>(props: T) => {
    const [layoutProps, otherProps] = createSplitProps<Styles>()(props, ['$css']);

    const { className, style } = sprinkles(layoutProps.$css ?? {});

    const mergedProps = { className, style };

    return mergeStatefulProps(mergedProps, otherProps) as T;
};
