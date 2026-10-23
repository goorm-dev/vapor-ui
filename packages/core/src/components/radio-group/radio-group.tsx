'use client';

import { forwardRef, useState } from 'react';

import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';

import { useFieldRequired } from '~/components/field/field';
import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useRenderElement } from '~/hooks/use-render-element';
import { useVaporId } from '~/hooks/use-vapor-id';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { RootVariants } from './radio-group.css';
import * as styles from './radio-group.css';

type RadioGroupVariants = RootVariants;
type RadioGroupSharedProps = RadioGroupVariants & {
    /**
     * Marks the radio group as invalid, applying error styles to every radio and radio card inside it. Sets `aria-invalid` on the `<div>` element.
     */
    invalid?: boolean;
    required?: boolean;
};

type RadioGroupContext = RadioGroupSharedProps & {
    setLabelElementId?: (id?: string) => void;
};

export const [RadioGroupProvider, useRadioGroupContext] = createContext<RadioGroupContext>({
    name: 'RadioGroup',
    hookName: 'useRadioGroupContext',
    providerName: 'RadioGroupProvider',
    defaultValue: { size: 'md', invalid: false },
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the RadioGroup compound component, which groups radios so only one can be selected at a time. Shares `size` and `invalid` with the radios inside it. Renders a `<div>` element.
 */
export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    const [labelElementId, setLabelElementId] = useState<string | undefined>(undefined);

    const [variantProps, otherProps] = createSplitProps<RadioGroupSharedProps>()(componentProps, [
        'size',
        'invalid',
        'required',
    ]);

    const { invalid, required } = variantProps;
    const dataAttrs = createDataAttributes({ invalid });

    useFieldRequired(required);

    return (
        <RadioGroupProvider value={{ setLabelElementId, ...variantProps }}>
            <BaseRadioGroup
                ref={ref}
                aria-labelledby={labelElementId}
                aria-invalid={invalid}
                required={required}
                className={cn(styles.root(), className)}
                {...dataAttrs}
                {...otherProps}
            />
        </RadioGroupProvider>
    );
});
RadioGroupRoot.displayName = 'RadioGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Label
 * -----------------------------------------------------------------------------------------------*/

/**
 * Visible label for the radio group, also used as the group's accessible name. Renders a `<span>` element.
 */
export const RadioGroupLabel = forwardRef<HTMLSpanElement, RadioGroupLabel.Props>((props, ref) => {
    const { render, id: idProp, className, ...componentProps } = resolveStyles(props);
    const { setLabelElementId, invalid } = useRadioGroupContext();

    const id = useVaporId(idProp);

    useIsoLayoutEffect(() => {
        setLabelElementId?.(id);
        return () => setLabelElementId?.(undefined);
    }, [id, setLabelElementId]);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        state: { invalid },
        props: {
            id,
            className: cn(styles.label, className),
            ...componentProps,
        },
    });
});
RadioGroupLabel.displayName = 'RadioGroup.Label';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.RequiredSymbol
 * -----------------------------------------------------------------------------------------------*/

export const RadioGroupRequiredSymbol = forwardRef<HTMLSpanElement, RadioGroupRequiredSymbol.Props>(
    (props, ref) => {
        const {
            render,
            className,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);
        const { required } = useRadioGroupContext();

        const children = childrenProp || '*';

        return useRenderElement({
            ref,
            render,
            enabled: !!required,
            defaultTagName: 'span',
            props: {
                'aria-hidden': true,
                className: cn(styles.requiredSymbol, className),
                children,
                ...componentProps,
            },
        });
    },
);
RadioGroupRequiredSymbol.displayName = 'RadioGroup.RequiredSymbol';

/* -----------------------------------------------------------------------------------------------*/

export namespace RadioGroupRoot {
    export type State = BaseRadioGroup.State;
    export interface Props
        extends VaporUIComponentProps<typeof BaseRadioGroup, State>, RadioGroupSharedProps {
        /**
         * Radios shown in the group, such as `Radio.Root` or `RadioCard` items and an optional `RadioGroup.Label`.
         */
        children?: BaseRadioGroup.Props['children'];
    }
    export type ChangeEventDetails = BaseRadioGroup.ChangeEventDetails;
}

export interface RadioGroupLabelState {
    /**
     * Whether the component is in an error state.
     */
    invalid?: boolean;
}

export namespace RadioGroupLabel {
    export type State = RadioGroupLabelState;
    export interface Props extends VaporUIComponentProps<'span', State> {
        /**
         * Text of the label, such as the question the radios answer.
         */
        children?: VaporUIComponentProps<'span', State>['children'];
    }
}

export namespace RadioGroupRequiredSymbol {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}
