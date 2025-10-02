'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui-components/react';
import clsx from 'clsx';

import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RootVariants } from './radio.css';
import * as styles from './radio.css';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RadioVariants = RootVariants;

type RootPrimitiveProps = VComponentProps<typeof BaseRadio.Root>;
interface RadioRootProps extends RootPrimitiveProps, RadioVariants {}

/**
 * Renders a radio button input with visual indicator. Renders a <button> element.
 */
const Root = forwardRef<HTMLButtonElement, RadioRootProps>(
    ({ className, children, ...props }, ref) => {
        const { size: contextSize, invalid: contextInvalid } = useRadioGroupContext();

        const [variantProps, otherProps] = createSplitProps<RadioVariants>()(props, [
            'invalid',
            'size',
        ]);
        const { size: sizeProp, invalid: invalidProp } = variantProps;

        const size = sizeProp || contextSize;
        const invalid = invalidProp || contextInvalid;

        const IndicatorElement = createSlot(children || <Indicator />);

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
    },
);
Root.displayName = 'RadioGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * Radio.Indicator
 * -----------------------------------------------------------------------------------------------*/

type IndicatorPrimitiveProps = VComponentProps<typeof BaseRadio.Indicator>;
interface RadioIndicatorProps extends IndicatorPrimitiveProps {}

/**
 * Renders the visual indicator for the radio button selection state. Renders a <div> element.
 */
const Indicator = forwardRef<HTMLDivElement, RadioIndicatorProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseRadio.Indicator
                ref={ref}
                className={clsx(styles.indicator, className)}
                {...props}
            />
        );
    },
);
Indicator.displayName = 'Radio.Indicator';

/* -----------------------------------------------------------------------------------------------*/

export { Root as RadioRoot, Indicator as RadioIndicator };
export type { RadioRootProps, RadioIndicatorProps };
export const Radio = { Root, Indicator };
