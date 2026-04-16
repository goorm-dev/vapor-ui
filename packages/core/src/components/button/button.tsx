import { forwardRef } from 'react';

import { Button as BaseButton } from '@base-ui/react/button';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { ButtonVariants } from './button.css';
import * as styles from './button.css';

export const Button = forwardRef<HTMLElement, Button.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(componentProps, [
        'colorPalette',
        'size',
        'variant',
    ]);

    return (
        <BaseButton
            ref={ref}
            className={cn(styles.root(variantsProps), className)}
            {...otherProps}
        />
    );
});
Button.displayName = 'Button';

export namespace Button {
    export type State = BaseButton.State;
    export type Props = VaporUIComponentProps<typeof BaseButton, State> & ButtonVariants;
}
