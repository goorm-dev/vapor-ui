'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui/react/radio';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RadioCardVariants } from './radio-card.css';
import * as styles from './radio-card.css';

export const RadioCard = forwardRef<HTMLElement, RadioCard.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { invalid: contextInvalid } = useRadioGroupContext();

    const [variantProps, otherProps] = createSplitProps<RadioCardVariants>()(componentProps, [
        'invalid',
    ]);

    const { invalid: invalidProp } = variantProps;
    const invalid = invalidProp || contextInvalid;

    const dataAttrs = createDataAttributes({ invalid });

    return (
        <BaseRadio.Root
            ref={ref}
            aria-invalid={invalid}
            className={clsx(styles.root({ invalid }), className)}
            {...dataAttrs}
            {...otherProps}
        />
    );
});
RadioCard.displayName = 'RadioCard';

export namespace RadioCard {
    type RootPrimitiveProps = VComponentProps<typeof BaseRadio.Root>;
    export interface Props extends RootPrimitiveProps, RadioCardVariants {}
}
