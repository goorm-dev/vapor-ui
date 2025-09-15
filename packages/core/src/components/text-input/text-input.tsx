'use client';

import { forwardRef, useEffect, useCallback } from 'react';

import { Input as BaseInput } from '@base-ui-components/react';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { Assign, VComponentProps } from '~/utils/types';

import { useInputGroupRootContext } from '../input-group';
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
        const groupContext = useInputGroupRootContext(false);

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            onValueChange?.(newValue);
            groupContext?.setValue(newValue);
        };

        // Contribute props to InputGroup context if available
        useEffect(() => {
            if (groupContext?.updateProps) {
                groupContext.updateProps({
                    onValueChange,
                    defaultValue,
                    maxLength: otherProps.maxLength,
                });
            }
        }, [groupContext, onValueChange, defaultValue, otherProps.maxLength]);

        // Create a combined ref callback that handles both the forwarded ref and InputGroup context
        const handleRef = useCallback((element: HTMLInputElement | null) => {
            // Handle the forwarded ref
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
            
            // Handle InputGroup context
            if (groupContext?.setInputRef) {
                groupContext.setInputRef(element);
            }
        }, [ref, groupContext]);

        // Use group context value if available, otherwise use component props
        const inputValue = groupContext ? groupContext.value : value;
        const inputDefaultValue = groupContext ? undefined : defaultValue;
        const maxLength = groupContext?.maxLength || otherProps.maxLength;

        return (
            <BaseInput
                ref={handleRef}
                value={inputValue}
                defaultValue={inputDefaultValue}
                maxLength={maxLength}
                aria-invalid={invalid}
                onChange={handleChange}
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
