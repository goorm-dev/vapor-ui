'use client';

import { forwardRef, useRef } from 'react';

import { Input as BaseInput } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import { useInputGroup } from '~/components/input-group';
import { createSplitProps } from '~/utils/create-split-props';
import type { Assign, VComponentProps } from '~/utils/types';

import type { RootVariants } from './text-input.css';
import * as styles from './text-input.css';

type TextInputVariants = RootVariants;
type BaseProps = TextInputVariants & {
    type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string, event: Event) => void;
};

/* -------------------------------------------------------------------------------------------------
 * TextInput
 * -----------------------------------------------------------------------------------------------*/

type TextInputPrimitiveProps = VComponentProps<typeof BaseInput>;
interface TextInputProps extends Assign<TextInputPrimitiveProps, BaseProps> {}

/**
 * Renders a text input field with various input types support. Renders an <input> element.
 */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ onValueChange, value: valueProp, defaultValue = '', className, ...props }, ref) => {
        const [textInputRootProps, otherProps] = createSplitProps<TextInputVariants>()(props, [
            'size',
            'invalid',
        ]);

        const { invalid, size } = textInputRootProps;
        const { current: isControlled } = useRef(valueProp !== undefined);

        const [value, setValue] = useControlled({
            controlled: valueProp,
            default: defaultValue,
            name: 'TextInput',
            state: 'value',
        });

        const handleChange = (value: string, event: Event) => {
            setValue(value);
            onValueChange?.(value, event);
        };

        useInputGroup({
            value,
            maxLength: otherProps.maxLength,
        });

        return (
            <BaseInput
                ref={ref}
                {...(isControlled ? { value } : { defaultValue })}
                aria-invalid={invalid}
                onValueChange={handleChange}
                className={clsx(styles.root({ invalid, size }), className)}
                {...otherProps}
            />
        );
    },
);
TextInput.displayName = 'TextInput';

/* -----------------------------------------------------------------------------------------------*/

export { TextInput };
export type { TextInputProps };
