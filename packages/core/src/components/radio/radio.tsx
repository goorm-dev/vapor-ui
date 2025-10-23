'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui-components/react';
import clsx from 'clsx';

import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RootVariants } from './radio.css';
import * as styles from './radio.css';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RadioVariants = RootVariants;

export const RadioRoot = forwardRef<HTMLButtonElement, RadioRoot.Props>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);
    const { size: contextSize, invalid: contextInvalid } = useRadioGroupContext();

    const [variantProps, otherProps] = createSplitProps<RadioVariants>()(componentProps, [
        'invalid',
        'size',
    ]);
    const { size: sizeProp, invalid: invalidProp } = variantProps;

    const size = sizeProp || contextSize;
    const invalid = invalidProp || contextInvalid;

    const IndicatorElement = createSlot(children || <RadioIndicator />);

    return (
        <BaseRadio.Root
            ref={ref}
            aria-invalid={invalid}
            className={clsx(styles.root({ size, invalid }), className)}
            {...otherProps}
        >
            <IndicatorElement />
        </BaseRadio.Root>
    );
});
RadioRoot.displayName = 'Radio.Root';

/* -------------------------------------------------------------------------------------------------
 * Radio.Indicator
 * -----------------------------------------------------------------------------------------------*/

export const RadioIndicator = forwardRef<HTMLDivElement, RadioIndicator.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseRadio.Indicator
            ref={ref}
            className={clsx(styles.indicator, className)}
            {...componentProps}
        />
    );
});
RadioIndicator.displayName = 'Radio.Indicator';

/* -----------------------------------------------------------------------------------------------*/

export namespace RadioRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseRadio.Root>;

    export interface Props extends RootPrimitiveProps, RadioVariants {}
}

export namespace RadioIndicator {
    type IndicatorPrimitiveProps = VComponentProps<typeof BaseRadio.Indicator>;

    export interface Props extends IndicatorPrimitiveProps {}
}
