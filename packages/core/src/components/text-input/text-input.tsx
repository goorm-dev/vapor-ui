'use client';

import type { ChangeEvent } from 'react';
import { forwardRef, useId } from 'react';

import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { Assign, VComponentProps } from '~/utils/types';

import type { FieldVariants, LabelVariants, RootVariants } from './text-input.css';
import * as styles from './text-input.css';

type TextInputVariants = RootVariants & LabelVariants & FieldVariants;
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

type TextInputPrimitiveProps = VComponentProps<'div'>;
interface TextInputRootProps extends Assign<TextInputPrimitiveProps, TextInputSharedProps> {}

const Root = forwardRef<HTMLDivElement, TextInputRootProps>(
    ({ render, className, ...props }, ref) => {
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

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root({ disabled }), className),
                ...otherProps,
            },
        });

        return (
            <TextInputProvider value={{ textInputId, ...textInputRootProps }}>
                {element}
            </TextInputProvider>
        );
    },
);
Root.displayName = 'TextInput.Root';

/* -------------------------------------------------------------------------------------------------
 * TextInput.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<'label'>;
interface TextInputLabelProps extends PrimitiveLabelProps {}

const Label = forwardRef<HTMLLabelElement, TextInputLabelProps>(
    ({ render, htmlFor, className, ...props }, ref) => {
        const { textInputId = htmlFor, visuallyHidden } = useTextInputContext();

        return useRender({
            ref,
            render: render || <label />,
            props: {
                htmlFor: htmlFor || textInputId,
                className: clsx(styles.label({ visuallyHidden }), className),
                ...props,
            },
        });
    },
);
Label.displayName = 'TextInput.Label';

/* -------------------------------------------------------------------------------------------------
 * TextInput.Field
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveInputProps = VComponentProps<'input'>;
interface TextInputFieldProps extends Omit<PrimitiveInputProps, keyof TextInputSharedProps> {}

const Field = forwardRef<HTMLInputElement, TextInputFieldProps>(
    ({ render, id: idProp, className, ...props }, ref) => {
        const {
            type,
            textInputId,
            value,
            onValueChange,
            defaultValue,
            disabled,
            invalid,
            readOnly,
            size,
            placeholder,
        } = useTextInputContext();

        const id = idProp || textInputId;

        return useRender({
            ref,
            render: render || <input />,
            props: {
                id,
                type,
                value,
                onChange(event: ChangeEvent<HTMLInputElement>) {
                    if (event.defaultPrevented) return;
                    if (disabled || readOnly) return;

                    onValueChange?.(event.target.value);
                },
                defaultValue,
                disabled,
                'aria-invalid': invalid,
                readOnly,
                placeholder,
                className: clsx(styles.field({ invalid, size }), className),
                ...props,
            },
        });
    },
);
Field.displayName = 'TextInput.Field';

/* -----------------------------------------------------------------------------------------------*/

export { Root as TextInputRoot, Label as TextInputLabel, Field as TextInputField };
export type { TextInputRootProps, TextInputLabelProps, TextInputFieldProps };

export const TextInput = { Root, Label, Field };
