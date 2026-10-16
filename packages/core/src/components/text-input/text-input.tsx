'use client';

import { forwardRef, useRef } from 'react';

import { Input as BaseInput } from '@base-ui/react/input';
import { useControlled } from '@base-ui/utils/useControlled';

import { useInputGroup } from '~/components/input-group';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { RootVariants } from './text-input.css';
import * as styles from './text-input.css';

/* -------------------------------------------------------------------------------------------------
 * TextInput
 * -----------------------------------------------------------------------------------------------*/

/**
 * Single-line text field for short input such as a name, email address, or password. Renders an `<input>` element.
 */
export const TextInput = forwardRef<HTMLElement, TextInput.Props>((props, ref) => {
    const {
        value: valueProp,
        onValueChange,
        defaultValue = '',
        className,
        ...componentProps
    } = resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<TextInputVariants>()(componentProps, [
        'size',
        'invalid',
    ]);

    const { invalid, size } = variantProps;
    const { disabled, readOnly, maxLength, required } = otherProps;

    const handleChange = (value: string, event: TextInput.ChangeEventDetails) => {
        setValue(value);
        onValueChange?.(value, event);
    };

    const { current: isControlled } = useRef(valueProp !== undefined);

    const [value, setValue] = useControlled({
        controlled: valueProp,
        default: defaultValue,
        name: 'TextInput',
        state: 'value',
    });

    useInputGroup({ value, maxLength });

    const dataAttrs = createDataAttributes({ disabled, readOnly, required, invalid });

    return (
        <BaseInput
            ref={ref}
            {...(isControlled ? { value } : { defaultValue })}
            aria-invalid={invalid}
            onValueChange={handleChange}
            className={cn(styles.root({ invalid, size }), className)}
            {...dataAttrs}
            {...otherProps}
        />
    );
});
TextInput.displayName = 'TextInput';

/* -----------------------------------------------------------------------------------------------*/

type TextInputVariants = RootVariants;

export interface TextInputProps
    extends
        Omit<VaporUIComponentProps<typeof BaseInput, TextInput.State>, 'size'>,
        TextInputVariants {
    /**
     * Kind of text the field accepts, such as an email address, password, or URL.
     */
    type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
    /**
     * Current text in the field. Use when controlled.
     */
    value?: string;
    /**
     * Initial text in the field. Use when uncontrolled.
     */
    defaultValue?: string;
    /**
     * Called when the text changes as the user types, pastes, or deletes. Receives the new text and the change event details.
     */
    onValueChange?: (value: string, event: TextInput.ChangeEventDetails) => void;
}

export namespace TextInput {
    export type State = BaseInput.State;
    export type Props = TextInputProps;
    export type ChangeEventDetails = BaseInput.ChangeEventDetails;
}
