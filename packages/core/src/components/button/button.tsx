import { forwardRef } from 'react';

import clsx from 'clsx';

import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

import type { ButtonVariants } from './button.css';
import * as styles from './button.css';

type ButtonPrimitiveProps = Omit<VaporComponentProps<'button'>, 'color'>;
type ButtonProps = ButtonPrimitiveProps & ButtonVariants;

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
