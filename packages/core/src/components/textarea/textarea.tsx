'use client';

import type { ChangeEvent, MutableRefObject } from 'react';
import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef } from 'react';

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
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    required?: boolean;
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
    ({ render, className, children, ...props }, ref) => {
        const textareaId = useId();
        const textareaRef = useRef<HTMLTextAreaElement | null>(null);
        const textareaSharedPropKeys: (keyof TextareaSharedProps)[] = [
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
            'aria-label',
            'aria-labelledby',
            'aria-describedby',
            'required',
        ];

        const [textareaRootProps, otherProps] = createSplitProps<TextareaSharedProps>()(
            props,
            textareaSharedPropKeys,
        );

        const { disabled } = textareaRootProps;

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root({ disabled }), className),
                children,
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
            'aria-label': ariaLabel,
            'aria-labelledby': ariaLabelledby,
            'aria-describedby': ariaDescribedby,
            required,
        } = useTextareaContext();

        const id = idProp || textareaId;

        const autoResizeTextarea = useMemo(() => {
            let cachedScrollbarWidth: number | null = null;
            
            const getScrollbarWidth = () => {
                if (cachedScrollbarWidth !== null) return cachedScrollbarWidth;
                
                const outer = document.createElement('div');
                outer.style.visibility = 'hidden';
                outer.style.overflow = 'scroll';
                // @ts-ignore - msOverflowStyle is IE specific
                outer.style.msOverflowStyle = 'scrollbar';
                document.body.appendChild(outer);
                
                const inner = document.createElement('div');
                outer.appendChild(inner);
                
                cachedScrollbarWidth = outer.offsetWidth - inner.offsetWidth;
                document.body.removeChild(outer);
                
                return cachedScrollbarWidth;
            };
            
            const performResize = () => {
                if (!autoResize || !contextTextareaRef?.current) return;

                const textarea = contextTextareaRef.current;

                // Create a hidden clone to measure the actual content height
                const hiddenDiv = document.createElement('div');
                const style = window.getComputedStyle(textarea);
                
                // Get the exact inner dimensions of the textarea
                const paddingLeft = parseInt(style.paddingLeft) || 0;
                const paddingRight = parseInt(style.paddingRight) || 0;
                
                // Always reserve space for scrollbar to maintain consistent width
                const scrollbarWidth = getScrollbarWidth();
                
                // Calculate content width with scrollbar space always reserved
                const totalWidth = textarea.offsetWidth;
                const exactContentWidth = totalWidth - paddingLeft - paddingRight - scrollbarWidth;
                
                // Copy relevant styles to the hidden div
                hiddenDiv.style.position = 'absolute';
                hiddenDiv.style.visibility = 'hidden';
                hiddenDiv.style.height = 'auto';
                hiddenDiv.style.width = exactContentWidth + 'px';
                hiddenDiv.style.fontSize = style.fontSize;
                hiddenDiv.style.fontFamily = style.fontFamily;
                hiddenDiv.style.fontWeight = style.fontWeight;
                hiddenDiv.style.lineHeight = style.lineHeight;
                hiddenDiv.style.letterSpacing = style.letterSpacing;
                hiddenDiv.style.wordSpacing = style.wordSpacing;
                // Don't add padding/border to the hidden div since we set exact content width
                hiddenDiv.style.padding = '0';
                hiddenDiv.style.border = 'none';
                hiddenDiv.style.margin = '0';
                hiddenDiv.style.boxSizing = 'content-box';
                hiddenDiv.style.whiteSpace = 'pre-wrap';
                hiddenDiv.style.overflowWrap = 'break-word';
                hiddenDiv.style.wordBreak = 'break-word';
                
                // Set the content exactly as it is in the textarea
                hiddenDiv.textContent = textarea.value || '';
                
                // Append to DOM to measure
                document.body.appendChild(hiddenDiv);
                
                // Get the measured height and add padding back
                const contentHeight = hiddenDiv.scrollHeight;
                const paddingTop = parseInt(style.paddingTop) || 0;
                const paddingBottom = parseInt(style.paddingBottom) || 0;
                const borderTop = parseInt(style.borderTopWidth) || 0;
                const borderBottom = parseInt(style.borderBottomWidth) || 0;
                
                const totalHeight = contentHeight + paddingTop + paddingBottom + borderTop + borderBottom;
                
                const maxHeight = 400; // Prevent unlimited growth
                const minHeight = parseInt(style.minHeight) || 60;
                
                const newHeight = Math.min(Math.max(totalHeight, minHeight), maxHeight);
                
                // Clean up
                document.body.removeChild(hiddenDiv);
                
                // Only update if height actually changed
                const currentHeight = parseInt(textarea.style.height) || textarea.offsetHeight;
                if (Math.abs(currentHeight - newHeight) > 1) {
                    // Set the height - CSS will handle scrollbar automatically
                    textarea.style.height = `${newHeight}px`;
                }
            };

            // Use requestAnimationFrame for smooth updates
            return () => {
                requestAnimationFrame(performResize);
            };
        }, [autoResize, contextTextareaRef]);

        useEffect(() => {
            if (autoResize) {
                autoResizeTextarea();
            }
        }, [value, autoResize, autoResizeTextarea]);

        const handleRef = useCallback(
            (node: HTMLTextAreaElement | null) => {
                if (contextTextareaRef) {
                    contextTextareaRef.current = node;
                }
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref && 'current' in ref) {
                    (ref as MutableRefObject<HTMLTextAreaElement | null>).current = node;
                }
            },
            [contextTextareaRef, ref],
        );

        return useRender({
            ref: handleRef,
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
                'aria-invalid': invalid || undefined,
                'aria-required': required || undefined,
                'aria-label': ariaLabel,
                'aria-labelledby': ariaLabelledby,
                'aria-describedby': ariaDescribedby,
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
                    if (textareaRef.current) {
                        setCurrentLength(textareaRef.current.value.length);
                    }
                };

                const textarea = textareaRef.current;

                try {
                    textarea.addEventListener('input', updateLength);

                    return () => {
                        try {
                            textarea.removeEventListener('input', updateLength);
                        } catch (error) {
                            // Silently handle cleanup errors
                            console.warn('Failed to remove textarea event listener:', error);
                        }
                    };
                } catch (error) {
                    console.warn('Failed to add textarea event listener:', error);
                }
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
                'aria-live': 'polite',
                'aria-atomic': 'true',
                role: 'status',
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
