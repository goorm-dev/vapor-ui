import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { createSlot } from '~/libs/create-slot';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

import { Button } from '../button';
import * as styles from './icon-button.css';

type IconButtonVariants = MergeRecipeVariants<typeof styles.root>;
type IconButtonPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'stretch'>;

interface IconButtonProps extends IconButtonVariants, IconButtonPrimitiveProps {
    'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ 'aria-label': ariaLabel, className, children, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<IconButtonVariants>()(props, ['shape']);

        const IconSlot = createSlot(children);

        return (
            <Button
                ref={ref}
                aria-label={ariaLabel}
                className={clsx(styles.root(variantProps), className)}
                {...otherProps}
                stretch={false}
            >
                <IconSlot aria-hidden className={styles.icon({ size: otherProps.size })} />
            </Button>
        );
    },
);

export { IconButton };
export type { IconButtonProps };
