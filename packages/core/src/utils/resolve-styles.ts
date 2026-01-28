import { sprinkles } from '~/styles/sprinkles.css';

import { createSplitProps } from './create-split-props';
import { mergeProps } from './merge-props';
import type { Styles } from './types';

export const resolveStyles = <T extends object>(props: T) => {
    const [{ $styles }, otherProps] = createSplitProps<Styles>()(props, ['$styles']);
    const { className, style } = sprinkles({ ...$styles });

    return mergeProps({ className, style } as T, otherProps);
};
