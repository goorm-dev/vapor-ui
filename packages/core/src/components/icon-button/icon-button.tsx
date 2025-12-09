import { forwardRef } from 'react';

import clsx from 'clsx';

import { useRenderElement } from '~/hooks/use-render-element';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { Button } from '../button';
import type { IconButtonVariants } from './icon-button.css';
import * as styles from './icon-button.css';

export const IconButton = forwardRef<HTMLButtonElement, IconButton.Props>((props, ref) => {
    const {
        'aria-label': ariaLabel,
        className,
        children,
        ...componentProps
    } = resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<IconButtonVariants>()(componentProps, [
        'shape',
    ]);

    const { size } = otherProps;

    // const IconElement = useMemo(() => createSlot(children), [children]);
    const IconElement = useRenderElement(children);

    return (
        <Button
            ref={ref}
            aria-label={ariaLabel}
            className={clsx(styles.root(variantProps), className)}
            {...otherProps}
        >
            <IconElement aria-hidden className={styles.icon({ size })} />
        </Button>
    );
});
IconButton.displayName = 'IconButton';

export namespace IconButton {
    type IconButtonPrimitiveProps = VComponentProps<typeof Button>;

    export interface Props extends IconButtonVariants, IconButtonPrimitiveProps {
        'aria-label': string;
    }
}
