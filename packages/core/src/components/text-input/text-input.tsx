'use client';

import { forwardRef } from 'react';

import { Input as BaseInput } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import { useInputGroupSync } from '~/hooks/use-input-group';
import { createSplitProps } from '~/utils/create-split-props';
import type { Assign, VComponentProps } from '~/utils/types';

import type { RootVariants } from './text-input.css';
import * as styles from './text-input.css';

type TextInputVariants = RootVariants;
type BaseProps = TextInputVariants & {
    type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
};

/* -------------------------------------------------------------------------------------------------
 * TextInput
 * -----------------------------------------------------------------------------------------------*/

type TextInputPrimitiveProps = VComponentProps<typeof BaseInput>;
interface TextInputProps extends Assign<TextInputPrimitiveProps, BaseProps> {}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ onValueChange, value: valueProp, defaultValue, className, ...props }, ref) => {
        const [textInputRootProps, otherProps] = createSplitProps<TextInputVariants>()(props, [
            'size',
            'invalid',
        ]);

        const { invalid, size } = textInputRootProps;
        const isControlled = valueProp !== undefined;

        // Use useControlled for unified value state management
        const [value, setValue] = useControlled({
            controlled: valueProp,
            default: defaultValue,
            name: 'TextInput',
            state: 'value',
        });

        // Handle InputGroup synchronization via custom hook
        const { syncOnChange } = useInputGroupSync({
            value,
            defaultValue,
            maxLength: otherProps.maxLength,
        });

        const handleChange = (
            ...params: Parameters<NonNullable<TextInputPrimitiveProps['onValueChange']>>
        ) => {
            const newValue = params[0];
            setValue(newValue);
            onValueChange?.(newValue);
            syncOnChange(newValue);
        };

        // Determine if this is a controlled component based on initial value prop
        const finalValue = value ?? '';

        return (
            <BaseInput
                ref={ref}
                {...(isControlled ? { value: finalValue } : { defaultValue: defaultValue ?? '' })}
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
