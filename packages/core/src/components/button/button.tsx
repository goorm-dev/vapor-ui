import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import type { Sprinkles } from '~/styles/sprinkles.css';
import { sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';
import { splitLayoutProps } from '~/utils/split-layout-props';

import * as styles from './button.css';

type ButtonPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof vapor.button>, 'color'>;
type ButtonVariants = MergeRecipeVariants<typeof styles.root>;

interface ButtonProps extends ButtonPrimitiveProps, ButtonVariants, Sprinkles {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, ...props }, ref) => {
        const [layoutProps, buttonProps] = splitLayoutProps(props);
        const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(buttonProps, [
            'color',
            'size',
            'variant',
            'stretch',
        ]);

        return (
            <vapor.button
                ref={ref}
                className={clsx(styles.root(variantsProps), sprinkles(layoutProps), className)}
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
