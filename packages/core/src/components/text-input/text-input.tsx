'use client';

import { forwardRef, useEffect } from 'react';

import { Input as BaseInput } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import { useInputGroupContext } from '~/components/input-group';
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
    ({ onValueChange, value, defaultValue, className, ...props }, ref) => {
        const [textInputRootProps, otherProps] = createSplitProps<TextInputVariants>()(props, [
            'size',
            'invalid',
        ]);

        const { invalid, size } = textInputRootProps;
        const groupContext = useInputGroupContext();

        // Use useControlled for unified value state management
        const [internalValue, setInternalValue] = useControlled({
            controlled: value,
            default: defaultValue,
            name: 'TextInput',
            state: 'value',
        });

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setInternalValue(newValue);
            onValueChange?.(newValue);

            // Update InputGroup context with current value
            if (groupContext?.updateValue) {
                groupContext.updateValue(newValue);
            }
        };

        // Set maxLength in InputGroup context on mount
        useEffect(() => {
            if (groupContext?.setMaxLength && otherProps.maxLength) {
                groupContext.setMaxLength(otherProps.maxLength);
            }
        }, [groupContext, otherProps.maxLength]);

        // Update context when internal value changes
        useEffect(() => {
            if (groupContext?.updateValue && internalValue !== undefined) {
                groupContext.updateValue(internalValue);
            }
        }, [groupContext, internalValue]);

        return (
            <BaseInput
                ref={ref}
                value={value !== undefined ? internalValue : undefined}
                defaultValue={value === undefined ? internalValue : undefined}
                aria-invalid={invalid}
                onChange={onValueChange !== undefined ? handleChange : undefined}
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
