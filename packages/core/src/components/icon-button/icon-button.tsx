import { forwardRef } from 'react';

import clsx from 'clsx';

import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Button } from '../button';
import type { IconButtonVariants } from './icon-button.css';
import * as styles from './icon-button.css';

type IconButtonPrimitiveProps = Omit<VComponentProps<typeof Button>, 'stretch'>;
interface IconButtonProps extends IconButtonVariants, IconButtonPrimitiveProps {
    'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
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

export { IconButton };
export type { IconButtonProps };
