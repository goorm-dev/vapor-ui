import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { ButtonVariants } from './button.css';
import * as styles from './button.css';

type ButtonPrimitiveProps = VComponentProps<'button'>;
interface ButtonProps extends ButtonPrimitiveProps, ButtonVariants {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(componentProps, [
        'color',
        'size',
        'variant',
        'stretch',
    ]);

    const dataAttrs = createDataAttributes({ disabled: otherProps.disabled });

    return useRender({
        ref,
        render: render || <button />,
        props: {
            className: clsx(styles.root(variantsProps), className),

            ...dataAttrs,
            ...otherProps,
        },
    });
});
Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
