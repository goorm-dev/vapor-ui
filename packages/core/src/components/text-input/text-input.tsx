'use client';

import { forwardRef, useRef } from 'react';

import { Input as BaseInput } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import { useInputGroup } from '~/components/input-group';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
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
            className={clsx(styles.root({ invalid, size }), className)}
            {...dataAttrs}
            {...otherProps}
        />
    );
});
TextInput.displayName = 'TextInput';

/* -----------------------------------------------------------------------------------------------*/

export namespace TextInput {
    type TextInputPrimitiveProps = VComponentProps<typeof BaseInput>;

    export interface Props extends Assign<TextInputPrimitiveProps, BaseProps> {}
    export type ChangeEventDetails = BaseInput.ChangeEventDetails;
}
