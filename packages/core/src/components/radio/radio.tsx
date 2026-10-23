'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui/react/radio';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RootVariants } from './radio.css';
import * as styles from './radio.css';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RadioVariants = RootVariants;

/**
 * Radio button for picking one option from a set. Use inside `RadioGroup.Root`. Renders a `<span>` element and a hidden `<input>` beside it.
 */
export const RadioRoot = forwardRef<HTMLElement, RadioRoot.Props>((props, ref) => {
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

    const childrenRender = createRender(childrenProp, <RadioIndicatorPrimitive />);
    const children = useRenderElement({
        render: childrenRender,
    });

    return (
        <BaseRadio.Root
            ref={ref}
            aria-invalid={invalid}
            className={cn(styles.root({ size, invalid }), className)}
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
 * Dot shown inside the radio while it is selected. Renders a `<span>` element.
 */
export const RadioIndicatorPrimitive = forwardRef<HTMLSpanElement, RadioIndicatorPrimitive.Props>(
    (props, ref) => {
        const { keepMounted = true, className, ...componentProps } = resolveStyles(props);

        const { invalid } = useRadioGroupContext();
        const dataAttrs = createDataAttributes({ invalid });

        return (
            <BaseRadio.Indicator
                ref={ref}
                keepMounted={keepMounted}
                className={cn(styles.indicator, className)}
                {...dataAttrs}
                {...componentProps}
            />
        );
    },
);
RadioIndicatorPrimitive.displayName = 'Radio.IndicatorPrimitive';

/* -----------------------------------------------------------------------------------------------*/

export namespace RadioRoot {
    export type State = BaseRadio.Root.State;
    export interface Props
        extends VaporUIComponentProps<typeof BaseRadio.Root, State>, RadioVariants {
        /**
         * Element shown inside the radio in place of the default `Radio.IndicatorPrimitive`, such as a `Radio.IndicatorPrimitive` with custom props. Anything other than a single element is ignored and the default indicator is shown.
         */
        children?: BaseRadio.Root.Props['children'];
    }
}

export namespace RadioIndicatorPrimitive {
    export type State = BaseRadio.Indicator.State;
    export type Props = VaporUIComponentProps<typeof BaseRadio.Indicator, State>;
}
