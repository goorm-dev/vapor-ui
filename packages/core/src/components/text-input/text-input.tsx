import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';

import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './text-input.css';

type TextInputVariants = MergeRecipeVariants<
    typeof styles.root | typeof styles.label | typeof styles.field
>;
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

type TextInputPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;

interface TextInputProps
    extends Omit<TextInputPrimitiveProps, keyof TextInputSharedProps>,
        TextInputSharedProps {}

const Root = forwardRef<HTMLDivElement, TextInputProps>(
    ({ className, children, ...props }, ref) => {
        const textInputId = useId();
        const [textInputProps, otherProps] = createSplitProps<TextInputSharedProps>()(props, [
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

        const { disabled } = textInputProps;

        return (
            <TextInputProvider value={{ textInputId, ...textInputProps }}>
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

type PrimitiveLabelProps = ComponentPropsWithoutRef<typeof vapor.label>;
interface TextInputLabelProps extends PrimitiveLabelProps {}

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

type PrimitiveInputProps = ComponentPropsWithoutRef<typeof vapor.input>;
interface TextInputFieldProps extends Omit<PrimitiveInputProps, keyof TextInputSharedProps> {}

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

export const TextInput = Object.assign(Root, { Label, Field });

export type { TextInputProps, TextInputLabelProps, TextInputFieldProps };
