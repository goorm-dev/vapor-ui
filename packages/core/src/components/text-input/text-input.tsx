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

/**
 * 사용자로부터 텍스트 입력을 받는 입력 필드 컴포넌트입니다.
 *
 * `<input>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/text-input TextInput Documentation}
 */
type TextInputPrimitiveProps = VComponentProps<typeof BaseInput>;
interface TextInputProps extends Assign<TextInputPrimitiveProps, BaseProps> {}

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
