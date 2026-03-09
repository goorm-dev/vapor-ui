import { forwardRef } from 'react';

import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';

import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Button } from '../button';
import type { IconButtonVariants } from './icon-button.css';
import * as styles from './icon-button.css';

export const IconButton = forwardRef<HTMLElement, IconButton.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<IconButtonVariants>()(componentProps, [
        'shape',
    ]);

    const childrenRender = createRender(childrenProp);
    const children = useRender({
        render: childrenRender,
        props: {
            'aria-hidden': 'true',
            className: styles.icon,
        },
    });

    return (
        <Button ref={ref} className={clsx(styles.root(variantProps), className)} {...otherProps}>
            {children}
        </Button>
    );
});
IconButton.displayName = 'IconButton';

export namespace IconButton {
    export type State = Button.State;
    export type Props = VaporUIComponentProps<typeof Button, State> & IconButtonVariants;
}
