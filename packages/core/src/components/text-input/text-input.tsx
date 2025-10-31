'use client';

import { forwardRef, useRef } from 'react';

import { Input as BaseInput } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import { useInputGroup } from '~/components/input-group';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
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

export const TextInput = forwardRef<HTMLInputElement, TextInput.Props>((props, ref) => {
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
            aria-invalid={invalid}
            {...(isControlled ? { value } : { defaultValue })}
            onValueChange={handleChange}
            className={clsx(styles.root({ invalid, size }), className)}
            {...otherProps}
        />
    );
});
TextInput.displayName = 'TextInput';

/* -----------------------------------------------------------------------------------------------*/

export namespace TextInput {
    type TextInputPrimitiveProps = VComponentProps<typeof BaseInput>;

    export interface Props extends Assign<TextInputPrimitiveProps, BaseProps> {}
}
