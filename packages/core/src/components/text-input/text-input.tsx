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
    onValueChange?: (value: string, event: TextInput.ChangeEventDetails) => void;
};

/* -------------------------------------------------------------------------------------------------
 * TextInput
 * -----------------------------------------------------------------------------------------------*/

export const TextInput = forwardRef<HTMLInputElement, TextInput.Props>(
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

        const handleChange = (value: string, event: TextInput.ChangeEventDetails) => {
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

export namespace TextInput {
    type TextInputPrimitiveProps = VComponentProps<typeof BaseInput>;

    export interface Props extends Assign<TextInputPrimitiveProps, BaseProps> {}
    export type ChangeEventDetails = BaseInput.ChangeEventDetails;
}
