'use client';

import { forwardRef, useId } from 'react';

import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

import type {
    TextInputFieldVariants,
    TextInputLabelVariants,
    TextInputRootVariants,
} from './text-input.css';
import * as styles from './text-input.css';

type TextInputVariants = TextInputRootVariants & TextInputLabelVariants & TextInputFieldVariants;
type TextInputSharedProps = TextInputVariants & {
    type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    readOnly?: boolean;
    placeholder?: string;
};

type TextInputContextType = TextInputSharedProps & {
    textInputId?: string;
};

const [TextInputProvider, useTextInputContext] = createContext<TextInputContextType>({
    name: 'TextInput',
    hookName: 'useTextInputContext',
    providerName: 'TextInputProvider',
});

/* -------------------------------------------------------------------------------------------------
 * TextInput
 * -----------------------------------------------------------------------------------------------*/

type TextInputPrimitiveProps = VaporComponentProps<'div'>;
type TextInputRootProps = Omit<TextInputPrimitiveProps, keyof TextInputSharedProps> &
    TextInputSharedProps;

const Root = forwardRef<HTMLDivElement, TextInputRootProps>(
    ({ className, children, ...props }, ref) => {
        const textInputId = useId();
        const [textInputRootProps, otherProps] = createSplitProps<TextInputSharedProps>()(props, [
            'type',
            'value',
            'onValueChange',
            'defaultValue',
            'size',
            'disabled',
            'invalid',
            'readOnly',
            'visuallyHidden',
            'placeholder',
        ]);

        const { disabled } = textInputRootProps;

        return (
            <TextInputProvider value={{ textInputId, ...textInputRootProps }}>
                <vapor.div
                    ref={ref}
                    className={clsx(styles.root({ disabled }), className)}
                    {...otherProps}
                >
                    {children}
                </vapor.div>
            </TextInputProvider>
        );
    },
);
Root.displayName = 'TextInput.Root';

/* -------------------------------------------------------------------------------------------------
 * TextInput.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VaporComponentProps<'label'>;
type TextInputLabelProps = PrimitiveLabelProps;

const Label = forwardRef<HTMLLabelElement, TextInputLabelProps>(
    ({ htmlFor, className, ...props }, ref) => {
        const { textInputId = htmlFor, visuallyHidden } = useTextInputContext();

        return (
            <vapor.label
                ref={ref}
                htmlFor={textInputId}
                className={clsx(styles.label({ visuallyHidden }), className)}
                {...props}
            />
        );
    },
);
Label.displayName = 'TextInput.Label';

/* -------------------------------------------------------------------------------------------------
 * TextInput.Field
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveInputProps = VaporComponentProps<'input'>;
type TextInputFieldProps = Omit<PrimitiveInputProps, keyof TextInputSharedProps>;

const Field = forwardRef<HTMLInputElement, TextInputFieldProps>(
    ({ id, className, ...props }, ref) => {
        const {
            type,
            textInputId = id,
            value,
            onValueChange,
            defaultValue,
            disabled,
            invalid,
            readOnly,
            size,
            placeholder,
        } = useTextInputContext();

        return (
            <vapor.input
                ref={ref}
                id={textInputId}
                type={type}
                value={value}
                onChange={(event) => onValueChange?.(event.target.value)}
                defaultValue={defaultValue}
                disabled={disabled}
                aria-invalid={invalid}
                readOnly={readOnly}
                placeholder={placeholder}
                className={clsx(styles.field({ invalid, size }), className)}
                {...props}
            />
        );
    },
);
Field.displayName = 'TextInput.Field';

/* -----------------------------------------------------------------------------------------------*/

export { Root as TextInputRoot, Label as TextInputLabel, Field as TextInputField };
export type { TextInputRootProps, TextInputLabelProps, TextInputFieldProps };

export const TextInput = { Root, Label, Field };
