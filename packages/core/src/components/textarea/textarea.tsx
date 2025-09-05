'use client';

import type { ChangeEvent, MutableRefObject } from 'react';
import { forwardRef, useCallback, useEffect, useId, useRef } from 'react';

import { Field as BaseField, useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { Assign, VComponentProps } from '~/utils/types';

import type { InputVariants, RootVariants } from './textarea.css';
import * as styles from './textarea.css';

type TextareaVariants = RootVariants & InputVariants;
type TextareaSharedProps = TextareaVariants & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    rows?: number;
    cols?: number;
    resizing?: boolean;
    autoResize?: boolean;
};

type TextareaContextType = TextareaSharedProps & {
    textareaId?: string;
};

const [TextareaProvider, useTextareaContext] = createContext<TextareaContextType>({
    name: 'Textarea',
    hookName: 'useTextareaContext',
    providerName: 'TextareaProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Textarea
 * -----------------------------------------------------------------------------------------------*/

type TextareaPrimitiveProps = VComponentProps<'div'>;
interface TextareaRootProps extends Assign<TextareaPrimitiveProps, TextareaSharedProps> {}

const Root = forwardRef<HTMLDivElement, TextareaRootProps>(
    ({ render, className, ...props }, ref) => {
        const textareaId = useId();
        const [textareaRootProps, otherProps] = createSplitProps<TextareaSharedProps>()(props, [
            'value',
            'onValueChange',
            'defaultValue',
            'size',
            'disabled',
            'invalid',
            'readOnly',
            'placeholder',
            'rows',
            'cols',
            'resizing',
            'autoResize',
        ]);

        const { disabled } = textareaRootProps;

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root({ disabled }), className),
                ...otherProps,
            },
        });

        return (
            <TextareaProvider value={{ textareaId, ...textareaRootProps }}>
                {element}
            </TextareaProvider>
        );
    },
);
Root.displayName = 'Textarea.Root';

/* -------------------------------------------------------------------------------------------------
 * Textarea.Input
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveTextareaProps = VComponentProps<'textarea'>;
interface TextareaInputProps extends Omit<PrimitiveTextareaProps, keyof TextareaSharedProps> {}

const Input = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
    ({ render, id: idProp, className, ...props }, ref) => {
        const {
            textareaId,
            value,
            onValueChange,
            defaultValue,
            disabled,
            invalid,
            readOnly,
            size,
            placeholder,
            rows,
            cols,
            resizing,
            autoResize,
        } = useTextareaContext();

        const id = idProp || textareaId;
        const textareaRef = useRef<HTMLTextAreaElement | null>(
            null,
        ) as MutableRefObject<HTMLTextAreaElement | null>;

        const autoResizeTextarea = useCallback(() => {
            if (!autoResize || !textareaRef.current) return;

            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }, [autoResize]);

        useEffect(() => {
            if (autoResize) {
                autoResizeTextarea();
            }
        }, [value, autoResize, autoResizeTextarea]);

        return useRender({
            ref: (node: HTMLTextAreaElement | null) => {
                textareaRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref && 'current' in ref) {
                    (ref as MutableRefObject<HTMLTextAreaElement | null>).current = node;
                }
            },
            render: render || <BaseField.Control render={<textarea />} />,
            props: {
                id,
                value,
                onChange(event: ChangeEvent<HTMLTextAreaElement>) {
                    if (event.defaultPrevented) return;
                    if (disabled || readOnly) return;

                    onValueChange?.(event.target.value);

                    if (autoResize) {
                        autoResizeTextarea();
                    }
                },
                defaultValue,
                disabled,
                'aria-invalid': invalid,
                readOnly,
                placeholder,
                rows,
                cols,
                className: clsx(styles.input({ invalid, size, resizing, autoResize }), className),
                ...props,
            },
        });
    },
);
Input.displayName = 'Textarea.Input';

/* -----------------------------------------------------------------------------------------------*/

export { Input as TextareaInput, Root as TextareaRoot };
export type { TextareaInputProps, TextareaRootProps };

export const Textarea = { Root, Input };
