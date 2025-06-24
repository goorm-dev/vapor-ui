import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Button } from '../button';
import * as styles from './icon-button.css';
import clsx from 'clsx';

import { createSlot } from '~/libs/create-slot';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

type IconButtonVariants = MergeRecipeVariants<typeof styles.root>;
type IconButtonPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'stretch'>;

interface IconButtonProps extends IconButtonVariants, IconButtonPrimitiveProps {}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, children, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<IconButtonVariants>()(props, [
            'rounded',
        ]);

        const IconSlot = createSlot(children);

        return (
            <Button
                ref={ref}
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
