'use client';

import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { FieldVariants, RootVariants } from './text-input.css';
import * as styles from './text-input.css';

type Override<T, U> = Omit<T, keyof U> & Partial<U>;

type TextInputVariants = RootVariants & FieldVariants;
type BaseProps = TextInputVariants & {
    type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
};

/* -------------------------------------------------------------------------------------------------
 * TextInput
 * -----------------------------------------------------------------------------------------------*/

type TextInputPrimitiveProps = VComponentProps<typeof Primitive.input>;
interface TextInputProps extends Override<TextInputPrimitiveProps, BaseProps> {}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ onValueChange, className, ...props }, ref) => {
        const [textInputRootProps, otherProps] = createSplitProps<TextInputVariants>()(props, [
            'size',
            'disabled',
            'invalid',
        ]);

        const { disabled, invalid, size } = textInputRootProps;

        return (
            <Primitive.input
                ref={ref}
                aria-invalid={invalid}
                disabled={disabled}
                onChange={(event) => onValueChange?.(event.target.value)}
                className={clsx(styles.field({ invalid, size }), className)}
                {...otherProps}
            />
        );
    },
);
TextInput.displayName = 'TextInput';

/* -----------------------------------------------------------------------------------------------*/

export { TextInput };
export type { TextInputProps };
