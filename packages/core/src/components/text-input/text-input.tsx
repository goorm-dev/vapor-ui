'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';

import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';
import { splitLayoutProps } from '~/utils/split-layout-props';

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

interface TextInputRootProps
    extends Omit<TextInputPrimitiveProps, keyof TextInputSharedProps>,
        TextInputSharedProps,
        Sprinkles {}

const Root = forwardRef<HTMLDivElement, TextInputRootProps>(
    ({ className, children, ...props }, ref) => {
        const textInputId = useId();
        const [layoutProps, textInputProps] = splitLayoutProps(props);
        const [textInputRootProps, otherProps] = createSplitProps<TextInputSharedProps>()(
            textInputProps,
            [
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
            ],
        );

        const { disabled } = textInputRootProps;

        return (
            <TextInputProvider value={{ textInputId, ...textInputRootProps }}>
                <vapor.div
                    ref={ref}
                    className={clsx(styles.root({ disabled }), sprinkles(layoutProps), className)}
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
interface TextInputLabelProps extends PrimitiveLabelProps, Sprinkles {}

const Label = forwardRef<HTMLLabelElement, TextInputLabelProps>(
    ({ htmlFor, className, ...props }, ref) => {
        const { textInputId = htmlFor, visuallyHidden } = useTextInputContext();
        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <vapor.label
                ref={ref}
                htmlFor={textInputId}
                className={clsx(
                    styles.label({ visuallyHidden }),
                    sprinkles(layoutProps),
                    className,
                )}
                {...otherProps}
            />
        );
    },
);
Label.displayName = 'TextInput.Label';

/* -------------------------------------------------------------------------------------------------
 * TextInput.Field
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveInputProps = ComponentPropsWithoutRef<typeof vapor.input>;
interface TextInputFieldProps
    extends Omit<PrimitiveInputProps, keyof TextInputSharedProps>,
        Omit<PrimitiveInputProps, keyof Sprinkles> {}

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
        const [layoutProps, otherProps] = splitLayoutProps(props);

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
                className={clsx(styles.field({ invalid, size }), sprinkles(layoutProps), className)}
                {...otherProps}
            />
        );
    },
);
Field.displayName = 'TextInput.Field';

/* -----------------------------------------------------------------------------------------------*/

export { Root as TextInputRoot, Label as TextInputLabel, Field as TextInputField };
export type { TextInputRootProps, TextInputLabelProps, TextInputFieldProps };

export const TextInput = { Root, Label, Field };
