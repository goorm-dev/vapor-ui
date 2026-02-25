import { forwardRef } from 'react';

import { Button as BaseButton } from '@base-ui/react/button';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

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
            className={clsx(styles.root(variantsProps), className)}
            {...otherProps}
        />
    );
});
Button.displayName = 'Button';

export namespace Button {
    type ButtonPrimitiveProps = VComponentProps<typeof BaseButton>;

    export interface Props extends ButtonPrimitiveProps, ButtonVariants {}
}
