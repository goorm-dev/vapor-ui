'use client';

import type { ChangeEvent, MutableRefObject } from 'react';
import React, { forwardRef, useId, useRef } from 'react';

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
    maxLength?: number;
};

type TextInputContextType = TextInputSharedProps & {
    textInputId?: string;
    textInputRef?: MutableRefObject<HTMLInputElement | null>;
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
        const textInputRef = useRef<HTMLInputElement | null>(null);
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
            'maxLength',
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
            <TextInputProvider value={{ textInputId, textInputRef, ...textInputRootProps }}>
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
            textInputRef: contextTextInputRef,
            value,
            onValueChange,
            defaultValue,
            disabled,
            invalid,
            readOnly,
            size,
            placeholder,
            maxLength,
        } = useTextInputContext();

        const id = idProp || textInputId;

        return useRender({
            ref: (node: HTMLInputElement | null) => {
                if (contextTextInputRef) {
                    contextTextInputRef.current = node;
                }
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref && 'current' in ref) {
                    (ref as MutableRefObject<HTMLInputElement | null>).current = node;
                }
            },
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
                maxLength,
                className: clsx(styles.field({ invalid, size }), className),
                ...props,
            },
        });
    },
);
Field.displayName = 'TextInput.Field';

/* -------------------------------------------------------------------------------------------------
 * TextInput.Count
 * -----------------------------------------------------------------------------------------------*/

type TextInputCountPrimitiveProps = VComponentProps<'div'>;
interface TextInputCountProps extends Omit<TextInputCountPrimitiveProps, 'children'> {
    children?: (props: { current: number; max?: number }) => React.ReactNode;
}

const Count = forwardRef<HTMLDivElement, TextInputCountProps>(
    ({ render, className, children, ...props }, ref) => {
        const { value, defaultValue, maxLength, textInputRef } = useTextInputContext();
        const [currentLength, setCurrentLength] = React.useState(() => {
            const initialValue = value ?? defaultValue ?? '';
            return initialValue.length;
        });

        React.useEffect(() => {
            if (value !== undefined) {
                setCurrentLength(value.length);
            } else if (textInputRef?.current) {
                const updateLength = () => {
                    setCurrentLength(textInputRef.current?.value.length || 0);
                };

                const input = textInputRef.current;
                input.addEventListener('input', updateLength);

                return () => {
                    input.removeEventListener('input', updateLength);
                };
            }
        }, [value, textInputRef]);

        const content = children
            ? children({ current: currentLength, max: maxLength })
            : maxLength !== undefined
              ? `${currentLength}/${maxLength}`
              : currentLength.toString();

        return useRender({
            ref,
            render: render || <span />,
            props: {
                className: clsx(styles.count, className),
                children: content,
                ...props,
            },
        });
    },
);
Count.displayName = 'TextInput.Count';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as TextInputRoot,
    Label as TextInputLabel,
    Field as TextInputField,
    Count as TextInputCount,
};
export type { TextInputRootProps, TextInputLabelProps, TextInputFieldProps, TextInputCountProps };

export const TextInput = { Root, Label, Field, Count };
