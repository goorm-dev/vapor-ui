import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import type { VComponentProps } from '~/utils/types';

import type { ButtonVariants } from './button.css';
import * as styles from './button.css';

export const Button = forwardRef<HTMLButtonElement, Button.Props>(
    ({ render, className, ...props }, ref) => {
        const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(props, [
            'color',
            'size',
            'variant',
            'stretch',
        ]);

        const { disabled } = otherProps;
        const dataAttrs = createDataAttributes({ disabled });

        return useRender({
            ref,
            render: render || <button />,
            props: {
                className: clsx(styles.root(variantsProps), className),
                ...dataAttrs,
                ...otherProps,
            },
        });
    },
);
Button.displayName = 'Button';

export namespace Button {
    type ButtonPrimitiveProps = VComponentProps<'button'>;

    export interface Props extends ButtonPrimitiveProps, ButtonVariants {}
}
