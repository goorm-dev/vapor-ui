import { sprinkles } from '~/styles/sprinkles.css';

import { createSplitProps } from './create-split-props';
import { mergeProps } from './merge-props';
import type { Styles } from './types';

export const resolveStyles = <T extends object>(props: T) => {
    const [{ $css }, otherProps] = createSplitProps<Styles>()(props, ['$css']);
    const { className, style } = sprinkles({ ...$css });

    return mergeProps({ className, style } as T, otherProps);
};
