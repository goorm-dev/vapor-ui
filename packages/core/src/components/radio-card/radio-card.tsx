'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui/react';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RadioCardVariants } from './radio-card.css';
import * as styles from './radio-card.css';

export const RadioCard = forwardRef<HTMLButtonElement, RadioCard.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { size: contextSize, invalid: contextInvalid } = useRadioGroupContext();

    const [variantProps, otherProps] = createSplitProps<RadioCardVariants>()(componentProps, [
        'invalid',
        'size',
    ]);

    const { size: sizeProp, invalid: invalidProp } = variantProps;

    const invalid = invalidProp || contextInvalid;
    const size = sizeProp || contextSize;

    const dataAttrs = createDataAttributes({ invalid });

    return (
        <BaseRadio.Root
            ref={ref}
            aria-invalid={invalid}
            className={clsx(styles.root({ size, invalid }), className)}
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
