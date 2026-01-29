'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui/react/radio';
import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';

import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RootVariants } from './radio.css';
import * as styles from './radio.css';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RadioVariants = RootVariants;

/**
 * Root component of Radio that renders a circular radio button. Renders a `<button>` element.
 */
export const RadioRoot = forwardRef<HTMLSpanElement, RadioRoot.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
    const { size: contextSize, invalid: contextInvalid } = useRadioGroupContext();

    const [variantProps, otherProps] = createSplitProps<RadioVariants>()(componentProps, [
        'invalid',
        'size',
    ]);
    const { size: sizeProp, invalid: invalidProp } = variantProps;

    const size = sizeProp || contextSize;
    const invalid = invalidProp || contextInvalid;

    const dataAttrs = createDataAttributes({ invalid });

    const children = useRender({
        render: createRender(childrenProp, <RadioIndicatorPrimitive />),
    });

    return (
        <BaseRadio.Root
            ref={ref}
            aria-invalid={invalid}
            className={clsx(styles.root({ size, invalid }), className)}
            {...dataAttrs}
            {...otherProps}
        >
            {children}
        </BaseRadio.Root>
    );
});
RadioRoot.displayName = 'Radio.Root';

/* -------------------------------------------------------------------------------------------------
 * Radio.IndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Visual indicator displayed when the radio button is checked. Renders a `<div>` element.
 */
export const RadioIndicatorPrimitive = forwardRef<HTMLDivElement, RadioIndicatorPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        const { invalid } = useRadioGroupContext();
        const dataAttrs = createDataAttributes({ invalid });

        return (
            <BaseRadio.Indicator
                ref={ref}
                className={clsx(styles.indicator, className)}
                {...dataAttrs}
                {...componentProps}
            />
        );
    },
);
RadioIndicatorPrimitive.displayName = 'Radio.IndicatorPrimitive';

/* -----------------------------------------------------------------------------------------------*/

export namespace RadioRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseRadio.Root>;

    export interface Props extends RootPrimitiveProps, RadioVariants {}
}

export namespace RadioIndicatorPrimitive {
    type IndicatorPrimitiveProps = VComponentProps<typeof BaseRadio.Indicator>;

    export interface Props extends IndicatorPrimitiveProps {}
}
