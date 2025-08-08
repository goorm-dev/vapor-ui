import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';

import type { ButtonVariants } from './button.css';
import * as styles from './button.css';

type ButtonPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof Primitive.button>, 'color'>;
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
            <Primitive.button
                ref={ref}
                className={clsx(styles.root(variantsProps), className)}
                data-disabled={otherProps.disabled}
                {...otherProps}
            >
                {children}
            </Primitive.button>
        );
    },
);
Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
