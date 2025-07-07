import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './button.css';

type ButtonPrimitiveProps = Omit<ComponentPropsWithoutRef<'button'>, 'color'>;
type ButtonVariants = MergeRecipeVariants<typeof styles.root>;

interface ButtonProps extends ButtonPrimitiveProps, ButtonVariants {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, ...props }, ref) => {
        const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(props, [
            'color',
            'size',
            'variant',
            'stretch',
        ]);

        return (
            <vapor.button
                ref={ref}
                className={clsx(styles.root(variantsProps), className)}
                data-disabled={otherProps.disabled}
                {...otherProps}
            >
                {children}
            </vapor.button>
        );
    },
);
Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
