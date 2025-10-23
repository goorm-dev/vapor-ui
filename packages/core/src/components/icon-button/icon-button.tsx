import { forwardRef } from 'react';

import clsx from 'clsx';

import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Button } from '../button';
import type { IconButtonVariants } from './icon-button.css';
import * as styles from './icon-button.css';

export const IconButton = forwardRef<HTMLButtonElement, IconButton.Props>((props, ref) => {
    const { 'aria-label': ariaLabel, className, children, ...componentProps } = props;
    const [variantProps, otherProps] = createSplitProps<IconButtonVariants>()(props, ['shape']);

    const IconElement = createSlot(children);

    return (
        <Button
            ref={ref}
            aria-label={ariaLabel}
            className={clsx(styles.root(variantProps), className)}
            {...componentProps}
            stretch={false}
        >
            <IconElement aria-hidden className={styles.icon({ size: otherProps.size })} />
        </Button>
    );
});
IconButton.displayName = 'IconButton';

export namespace IconButton {
    type IconButtonPrimitiveProps = Omit<VComponentProps<typeof Button>, 'stretch'>;

    export interface Props extends IconButtonVariants, IconButtonPrimitiveProps {
        'aria-label': string;
    }
}
