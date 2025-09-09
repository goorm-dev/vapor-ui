'use client';

import type { ChangeEvent, MutableRefObject } from 'react';
import React, { forwardRef, useCallback, useEffect, useId, useRef } from 'react';

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
    maxLength?: number;
};

type TextareaContextType = TextareaSharedProps & {
    textareaId?: string;
    textareaRef?: MutableRefObject<HTMLTextAreaElement | null>;
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
        const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
            'maxLength',
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
            <TextareaProvider value={{ textareaId, textareaRef, ...textareaRootProps }}>
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
            textareaRef: contextTextareaRef,
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
            maxLength,
        } = useTextareaContext();

        const id = idProp || textareaId;

        const autoResizeTextarea = useCallback(() => {
            if (!autoResize || !contextTextareaRef?.current) return;

            const textarea = contextTextareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }, [autoResize, contextTextareaRef]);

        useEffect(() => {
            if (autoResize) {
                autoResizeTextarea();
            }
        }, [value, autoResize, autoResizeTextarea]);

        return useRender({
            ref: (node: HTMLTextAreaElement | null) => {
                if (contextTextareaRef) {
                    contextTextareaRef.current = node;
                }
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
                maxLength,
                className: clsx(styles.input({ invalid, size, resizing, autoResize }), className),
                ...props,
            },
        });
    },
);
Input.displayName = 'Textarea.Input';

/* -------------------------------------------------------------------------------------------------
 * Textarea.Count
 * -----------------------------------------------------------------------------------------------*/

type TextareaCountPrimitiveProps = VComponentProps<'div'>;
interface TextareaCountProps extends Omit<TextareaCountPrimitiveProps, 'children'> {
    children?: (props: { current: number; max?: number }) => React.ReactNode;
}

const Count = forwardRef<HTMLDivElement, TextareaCountProps>(
    ({ render, className, children, ...props }, ref) => {
        const { value, defaultValue, maxLength, textareaRef } = useTextareaContext();
        const [currentLength, setCurrentLength] = React.useState(() => {
            const initialValue = value ?? defaultValue ?? '';
            return initialValue.length;
        });

        React.useEffect(() => {
            if (value !== undefined) {
                setCurrentLength(value.length);
            } else if (textareaRef?.current) {
                const updateLength = () => {
                    setCurrentLength(textareaRef.current?.value.length || 0);
                };

                const textarea = textareaRef.current;
                textarea.addEventListener('input', updateLength);

                return () => {
                    textarea.removeEventListener('input', updateLength);
                };
            }
        }, [value, textareaRef]);

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
Count.displayName = 'Textarea.Count';

/* -----------------------------------------------------------------------------------------------*/

export { Count as TextareaCount, Input as TextareaInput, Root as TextareaRoot };
export type { TextareaCountProps, TextareaInputProps, TextareaRootProps };

export const Textarea = { Root, Input, Count };
