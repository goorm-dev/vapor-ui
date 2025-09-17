'use client';

import type { ChangeEvent } from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';

import { Field as BaseField, useRender } from '@base-ui-components/react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import type { Assign, VComponentProps } from '~/utils/types';

import type { InputVariants } from './textarea.css';
import * as styles from './textarea.css';

type TextareaProps = InputVariants & {
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
    minHeight?: string | number;
    maxHeight?: string | number;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    required?: boolean;
};

type PrimitiveTextareaProps = VComponentProps<'textarea'>;
interface TextareaComponentProps extends Assign<PrimitiveTextareaProps, TextareaProps> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaComponentProps>(
    (
        {
            render,
            className,
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
            minHeight = 116,
            maxHeight = 400,
            'aria-label': ariaLabel,
            'aria-labelledby': ariaLabelledby,
            'aria-describedby': ariaDescribedby,
            required,
            ...props
        },
        ref,
    ) => {
        const textareaRef = useRef<HTMLTextAreaElement | null>(null);

        const autoResizeTextarea = useMemo(() => {
            const performResize = () => {
                if (!autoResize || !textareaRef?.current) return;

                const textarea = textareaRef.current;
                const maxHeightPx =
                    typeof maxHeight === 'number' ? maxHeight : parseFloat(maxHeight);
                const minHeightPx =
                    typeof minHeight === 'number' ? minHeight : parseFloat(minHeight);

                // Reset to get accurate measurement
                textarea.style.overflowY = 'hidden';
                textarea.style.height = 'auto';

                const scrollHeight = textarea.scrollHeight;

                if (scrollHeight > maxHeightPx) {
                    textarea.style.height = `${maxHeightPx}px`;
                    textarea.style.overflowY = 'scroll';
                } else {
                    const newHeight = Math.max(scrollHeight, minHeightPx);
                    textarea.style.height = `${newHeight}px`;
                    textarea.style.overflowY = 'hidden';
                }
            };

            return () => requestAnimationFrame(performResize);
        }, [autoResize, maxHeight, minHeight]);

        useEffect(() => {
            if (autoResize) {
                autoResizeTextarea();
            }
        }, [value, autoResize, autoResizeTextarea]);

        const handleRef = useCallback(
            (node: HTMLTextAreaElement | null) => {
                textareaRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref && 'current' in ref) {
                    ref.current = node;
                }
            },
            [ref],
        );

        const styleVars = assignInlineVars({
            [styles.textareaMinHeightVar]:
                typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
            [styles.textareaMaxHeightVar]:
                typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        });

        return useRender({
            ref: handleRef,
            render: render || <BaseField.Control render={<textarea />} />,
            props: {
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
                style: { ...styleVars, ...props.style },
                ...props,
            },
        });
    },
);
Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaComponentProps as TextareaProps };
